"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { TemplateCategory, TemplateFramework } from "@/lib/types";

interface SellerSubmissionFormProps {
  initialEmail?: string;
}

interface SellerSubmissionResponse {
  submission: {
    id: string;
    templateSlug: string;
    status: "pending-review" | "needs-updates" | "approved";
    payoutSharePct: number;
    estimatedPayoutCents: number;
    checks: Array<{
      id: "required-files" | "readme-quality" | "test-coverage";
      label: string;
      passed: boolean;
      detail: string;
    }>;
  };
}

const CATEGORY_OPTIONS: Array<{ value: TemplateCategory; label: string }> = [
  { value: "support", label: "Support" },
  { value: "content", label: "Content" },
  { value: "data", label: "Data" },
  { value: "devtools", label: "Devtools" }
];

const FRAMEWORK_OPTIONS: Array<{
  value: TemplateFramework;
  label: string;
}> = [
  { value: "claude-code", label: "Claude Code" },
  { value: "openclaw", label: "OpenClaw" },
  { value: "langgraph", label: "LangGraph" },
  { value: "crewai", label: "CrewAI" }
];

const DEFAULT_INCLUDED_FILES = [
  "SOUL.md",
  "IDENTITY.md",
  "AGENTS.md",
  "README.md",
  "CUSTOMIZE.md",
  "tools/tool-configs.json",
  "memory/schema.json",
  "tests/scenarios.md"
].join("\n");

function parseIncludedFiles(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/\n|,/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
  );
}

export function SellerSubmissionForm({ initialEmail }: SellerSubmissionFormProps) {
  const router = useRouter();
  const [sellerEmail, setSellerEmail] = useState(initialEmail ?? "");
  const [sellerName, setSellerName] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateSlug, setTemplateSlug] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("support");
  const [frameworks, setFrameworks] = useState<TemplateFramework[]>([
    "claude-code"
  ]);
  const [priceUsd, setPriceUsd] = useState("99");
  const [zipPath, setZipPath] = useState("/uploads/template.zip");
  const [includedFiles, setIncludedFiles] = useState(DEFAULT_INCLUDED_FILES);
  const [readmeWordCount, setReadmeWordCount] = useState("180");
  const [testScenarioCount, setTestScenarioCount] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SellerSubmissionResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit = useMemo(
    () => frameworks.length > 0 && !isPending,
    [frameworks.length, isPending]
  );

  function toggleFramework(framework: TemplateFramework): void {
    setFrameworks((current) => {
      if (current.includes(framework)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((entry) => entry !== framework);
      }

      return [...current, framework];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setResult(null);

    const parsedPrice = Number(priceUsd);
    const parsedReadmeWords = Number(readmeWordCount);
    const parsedTestScenarios = Number(testScenarioCount);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Set a valid template price in USD.");
      return;
    }

    if (frameworks.length === 0) {
      setError("Select at least one framework.");
      return;
    }

    const payload = {
      sellerEmail,
      sellerName,
      templateTitle,
      templateSlug,
      category,
      frameworks,
      priceUsd: parsedPrice,
      zipPath,
      includedFiles: parseIncludedFiles(includedFiles),
      readmeWordCount: parsedReadmeWords,
      testScenarioCount: parsedTestScenarios
    };

    startTransition(async () => {
      const response = await fetch("/api/seller/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const responsePayload = (await response.json().catch(() => null)) as
        | SellerSubmissionResponse
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(
          responsePayload && "error" in responsePayload
            ? responsePayload.error ?? "Could not submit template."
            : "Could not submit template."
        );
        return;
      }

      setResult(responsePayload as SellerSubmissionResponse);
      router.refresh();
    });
  }

  return (
    <div className="wizard-stack">
      <form className="checkout-form seller-form" onSubmit={handleSubmit}>
        <label>
          Seller email
          <input
            type="email"
            value={sellerEmail}
            onChange={(event) => setSellerEmail(event.currentTarget.value)}
            placeholder="creator@studio.dev"
            required
          />
        </label>

        <label>
          Studio or seller name
          <input
            value={sellerName}
            onChange={(event) => setSellerName(event.currentTarget.value)}
            placeholder="Creator Labs"
            minLength={2}
            maxLength={80}
            required
          />
        </label>

        <label>
          Template title
          <input
            value={templateTitle}
            onChange={(event) => setTemplateTitle(event.currentTarget.value)}
            placeholder="Refund Guard Agent"
            minLength={3}
            maxLength={120}
            required
          />
        </label>

        <label>
          Template slug
          <input
            value={templateSlug}
            onChange={(event) => setTemplateSlug(event.currentTarget.value)}
            placeholder="refund-guard-agent"
            minLength={2}
            maxLength={80}
            required
          />
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.currentTarget.value as TemplateCategory)}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="filter-group seller-framework-group">
          <legend>Framework compatibility</legend>
          <div className="checkbox-list seller-framework-list">
            {FRAMEWORK_OPTIONS.map((option) => (
              <label key={option.value} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={frameworks.includes(option.value)}
                  onChange={() => toggleFramework(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Price (USD)
          <input
            type="number"
            min="1"
            step="1"
            value={priceUsd}
            onChange={(event) => setPriceUsd(event.currentTarget.value)}
            required
          />
        </label>

        <label>
          Upload package path
          <input
            value={zipPath}
            onChange={(event) => setZipPath(event.currentTarget.value)}
            placeholder="/uploads/refund-guard-agent.zip"
            minLength={8}
            maxLength={240}
            required
          />
        </label>

        <label>
          Included files (one path per line)
          <textarea
            value={includedFiles}
            onChange={(event) => setIncludedFiles(event.currentTarget.value)}
            required
          />
        </label>

        <label>
          README word count
          <input
            type="number"
            min="0"
            step="1"
            value={readmeWordCount}
            onChange={(event) => setReadmeWordCount(event.currentTarget.value)}
            required
          />
        </label>

        <label>
          Test scenario count
          <input
            type="number"
            min="0"
            step="1"
            value={testScenarioCount}
            onChange={(event) => setTestScenarioCount(event.currentTarget.value)}
            required
          />
        </label>

        <button type="submit" disabled={!canSubmit}>
          {isPending ? "Submitting..." : "Submit template for review"}
        </button>
      </form>

      {error ? <p className="error-message">{error}</p> : null}

      {result ? (
        <section className="detail-panel seller-result" aria-live="polite">
          <h3>Submission received</h3>
          <p className="muted">Submission id: {result.submission.id}</p>
          <p className="muted">Template slug: {result.submission.templateSlug}</p>
          <p>
            Revenue share: {result.submission.payoutSharePct}% (
            {(result.submission.estimatedPayoutCents / 100).toLocaleString("en-US", {
              style: "currency",
              currency: "USD"
            })}{" "}
            estimated payout per sale)
          </p>
          <p>
            Status:{" "}
            <span
              className={`pill submission-status-pill ${
                result.submission.status === "pending-review"
                  ? "submission-status-pill-pending"
                  : "submission-status-pill-needs-updates"
              }`}
            >
              {result.submission.status === "pending-review"
                ? "Pending manual review"
                : "Needs updates"}
            </span>
          </p>
          <ul className="seller-check-list">
            {result.submission.checks.map((check) => (
              <li key={check.id}>
                <strong>{check.label}:</strong> {check.detail}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

