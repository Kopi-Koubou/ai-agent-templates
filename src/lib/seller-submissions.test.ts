import { beforeEach, describe, expect, test } from "vitest";

import {
  clearSellerSubmissionStoreForTests,
  createSellerSubmission,
  listSellerSubmissions,
  listSellerSubmissionsByEmail
} from "@/lib/seller-submissions";

describe("seller submission store", () => {
  beforeEach(() => {
    clearSellerSubmissionStoreForTests();
  });

  test("creates a pending-review submission when checks pass", () => {
    const submission = createSellerSubmission({
      sellerEmail: "Creator@Example.com",
      sellerName: "Creator Labs",
      templateTitle: "Refund Guard Agent",
      templateSlug: "refund-guard-agent",
      category: "support",
      frameworks: ["claude-code", "openclaw"],
      priceCents: 12900,
      zipPath: "/uploads/refund-guard-agent.zip",
      includedFiles: [
        "SOUL.md",
        "IDENTITY.md",
        "AGENTS.md",
        "README.md",
        "CUSTOMIZE.md",
        "tools/tool-configs.json",
        "memory/schema.json",
        "tests/refund-cases.md"
      ],
      readmeWordCount: 240,
      testScenarioCount: 32
    });

    expect(submission.id).toMatch(/^sub_/);
    expect(submission.sellerEmail).toBe("creator@example.com");
    expect(submission.status).toBe("pending-review");
    expect(submission.payoutSharePct).toBe(70);
    expect(submission.estimatedPayoutCents).toBe(9030);
    expect(submission.checks.every((check) => check.passed)).toBe(true);
  });

  test("flags submissions that fail automated checks", () => {
    const submission = createSellerSubmission({
      sellerEmail: "creator@example.com",
      sellerName: "Creator Labs",
      templateTitle: "Lean Agent",
      templateSlug: "lean-agent",
      category: "support",
      frameworks: ["claude-code"],
      priceCents: 7900,
      zipPath: "/uploads/lean-agent.zip",
      includedFiles: ["README.md", "SOUL.md", "tools/tool-configs.json"],
      readmeWordCount: 56,
      testScenarioCount: 4
    });

    expect(submission.status).toBe("needs-updates");
    expect(submission.checks.some((check) => !check.passed)).toBe(true);
    expect(
      submission.checks.find((check) => check.id === "required-files")?.detail
    ).toContain("Missing");
  });

  test("lists submissions by normalized seller email", () => {
    createSellerSubmission({
      sellerEmail: "creator@example.com",
      sellerName: "Creator Labs",
      templateTitle: "Template A",
      templateSlug: "template-a",
      category: "support",
      frameworks: ["claude-code"],
      priceCents: 7900,
      zipPath: "/uploads/template-a.zip",
      includedFiles: [
        "SOUL.md",
        "IDENTITY.md",
        "AGENTS.md",
        "README.md",
        "CUSTOMIZE.md",
        "tools/tool-configs.json",
        "memory/schema.json",
        "tests/scenarios.md"
      ],
      readmeWordCount: 150,
      testScenarioCount: 30
    });

    createSellerSubmission({
      sellerEmail: "other@example.com",
      sellerName: "Other Labs",
      templateTitle: "Template B",
      templateSlug: "template-b",
      category: "data",
      frameworks: ["openclaw"],
      priceCents: 9900,
      zipPath: "/uploads/template-b.zip",
      includedFiles: [
        "SOUL.md",
        "IDENTITY.md",
        "AGENTS.md",
        "README.md",
        "CUSTOMIZE.md",
        "tools/tool-configs.json",
        "memory/schema.json",
        "tests/scenarios.md"
      ],
      readmeWordCount: 180,
      testScenarioCount: 40
    });

    const all = listSellerSubmissions();
    expect(all).toHaveLength(2);

    const creatorSubmissions = listSellerSubmissionsByEmail("Creator@Example.com");
    expect(creatorSubmissions).toHaveLength(1);
    expect(creatorSubmissions[0]?.sellerEmail).toBe("creator@example.com");
    expect(creatorSubmissions[0]?.templateSlug).toBe("template-a");
  });
});

