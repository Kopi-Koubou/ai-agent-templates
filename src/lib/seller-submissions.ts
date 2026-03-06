import { TemplateCategory, TemplateFramework } from "@/lib/types";

const REVIEW_SLA_HOURS = 48;
const SELLER_PAYOUT_SHARE_PCT = 70;

const REQUIRED_TEMPLATE_FILES = [
  "soul.md",
  "identity.md",
  "agents.md",
  "readme.md",
  "customize.md",
  "tools/tool-configs.json",
  "memory/schema.json",
  "tests/"
] as const;

const README_MIN_WORD_COUNT = 120;
const TEST_MIN_SCENARIO_COUNT = 25;

export type SellerSubmissionStatus =
  | "pending-review"
  | "needs-updates"
  | "approved";

export interface SellerSubmissionCheck {
  id: "required-files" | "readme-quality" | "test-coverage";
  label: string;
  passed: boolean;
  detail: string;
}

export interface CreateSellerSubmissionInput {
  sellerEmail: string;
  sellerName: string;
  templateTitle: string;
  templateSlug: string;
  category: TemplateCategory;
  frameworks: TemplateFramework[];
  priceCents: number;
  zipPath: string;
  includedFiles: string[];
  readmeWordCount: number;
  testScenarioCount: number;
}

export interface SellerTemplateSubmission {
  id: string;
  sellerEmail: string;
  sellerName: string;
  templateTitle: string;
  templateSlug: string;
  category: TemplateCategory;
  frameworks: TemplateFramework[];
  priceCents: number;
  estimatedPayoutCents: number;
  payoutSharePct: number;
  zipPath: string;
  includedFiles: string[];
  readmeWordCount: number;
  testScenarioCount: number;
  checks: SellerSubmissionCheck[];
  status: SellerSubmissionStatus;
  reviewSlaHours: number;
  createdAt: string;
}

const submissions: SellerTemplateSubmission[] = [];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeFilePath(path: string): string {
  return path
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/^\.?\//, "")
    .toLowerCase();
}

function uniqNormalized(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => normalizeFilePath(value)).filter(Boolean))
  );
}

function buildRequiredFilesCheck(includedFiles: string[]): SellerSubmissionCheck {
  const normalizedIncludedFiles = uniqNormalized(includedFiles);
  const missing = REQUIRED_TEMPLATE_FILES.filter(
    (requiredPath) =>
      !normalizedIncludedFiles.some((includedPath) => {
        if (requiredPath.endsWith("/")) {
          return includedPath.startsWith(requiredPath);
        }

        return includedPath === requiredPath;
      })
  );

  if (missing.length === 0) {
    return {
      id: "required-files",
      label: "Required files",
      passed: true,
      detail: "All required template files were detected."
    };
  }

  return {
    id: "required-files",
    label: "Required files",
    passed: false,
    detail: `Missing ${missing.length} required paths: ${missing.join(", ")}.`
  };
}

function buildReadmeQualityCheck(readmeWordCount: number): SellerSubmissionCheck {
  if (readmeWordCount >= README_MIN_WORD_COUNT) {
    return {
      id: "readme-quality",
      label: "README quality",
      passed: true,
      detail: `README depth looks good (${readmeWordCount} words).`
    };
  }

  return {
    id: "readme-quality",
    label: "README quality",
    passed: false,
    detail: `README is too short (${readmeWordCount} words). Add setup, architecture, and test guidance.`
  };
}

function buildTestCoverageCheck(
  testScenarioCount: number
): SellerSubmissionCheck {
  if (testScenarioCount >= TEST_MIN_SCENARIO_COUNT) {
    return {
      id: "test-coverage",
      label: "Test coverage",
      passed: true,
      detail: `Test coverage threshold met (${testScenarioCount} scenarios).`
    };
  }

  return {
    id: "test-coverage",
    label: "Test coverage",
    passed: false,
    detail: `Only ${testScenarioCount} scenarios provided. Minimum is ${TEST_MIN_SCENARIO_COUNT}.`
  };
}

function resolveSubmissionStatus(
  checks: SellerSubmissionCheck[]
): SellerSubmissionStatus {
  return checks.every((check) => check.passed) ? "pending-review" : "needs-updates";
}

function estimatePayout(priceCents: number): number {
  return Math.round((priceCents * SELLER_PAYOUT_SHARE_PCT) / 100);
}

export function buildSellerSubmissionChecks(
  input: Pick<
    CreateSellerSubmissionInput,
    "includedFiles" | "readmeWordCount" | "testScenarioCount"
  >
): SellerSubmissionCheck[] {
  return [
    buildRequiredFilesCheck(input.includedFiles),
    buildReadmeQualityCheck(input.readmeWordCount),
    buildTestCoverageCheck(input.testScenarioCount)
  ];
}

export function createSellerSubmission(
  input: CreateSellerSubmissionInput
): SellerTemplateSubmission {
  const checks = buildSellerSubmissionChecks(input);

  const submission: SellerTemplateSubmission = {
    id: `sub_${crypto.randomUUID().slice(0, 10)}`,
    sellerEmail: normalizeEmail(input.sellerEmail),
    sellerName: input.sellerName.trim(),
    templateTitle: input.templateTitle.trim(),
    templateSlug: normalizeSlug(input.templateSlug),
    category: input.category,
    frameworks: Array.from(new Set(input.frameworks)),
    priceCents: Math.round(input.priceCents),
    estimatedPayoutCents: estimatePayout(input.priceCents),
    payoutSharePct: SELLER_PAYOUT_SHARE_PCT,
    zipPath: input.zipPath.trim(),
    includedFiles: uniqNormalized(input.includedFiles),
    readmeWordCount: Math.max(0, Math.round(input.readmeWordCount)),
    testScenarioCount: Math.max(0, Math.round(input.testScenarioCount)),
    checks,
    status: resolveSubmissionStatus(checks),
    reviewSlaHours: REVIEW_SLA_HOURS,
    createdAt: new Date().toISOString()
  };

  submissions.unshift(submission);
  return submission;
}

export function listSellerSubmissions(): SellerTemplateSubmission[] {
  return [...submissions].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
  );
}

export function listSellerSubmissionsByEmail(
  sellerEmail: string
): SellerTemplateSubmission[] {
  const normalizedEmail = normalizeEmail(sellerEmail);
  return listSellerSubmissions().filter(
    (submission) => submission.sellerEmail === normalizedEmail
  );
}

export function clearSellerSubmissionStoreForTests(): void {
  submissions.length = 0;
}

