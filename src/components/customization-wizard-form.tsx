"use client";

import { FormEvent, useMemo, useState } from "react";

import {
  CUSTOMIZATION_RISK_OPTIONS,
  CUSTOMIZATION_TONE_OPTIONS,
  CUSTOMIZATION_TOOL_OPTIONS,
  CustomizationRiskTolerance,
  CustomizationTone,
  CustomizationTool
} from "@/lib/customization";
import { TemplateFramework } from "@/lib/types";

interface CustomizationWizardFormProps {
  templateSlug: string;
  templateTitle: string;
  frameworks: TemplateFramework[];
}

interface CustomizationResponse {
  templateSlug: string;
  templateTitle: string;
  customization: {
    packageName: string;
    generatedAt: string;
    profile: {
      companyName: string;
      useCase: string;
      tone: CustomizationTone;
      riskTolerance: CustomizationRiskTolerance;
      deploymentTarget: TemplateFramework;
      tools: CustomizationTool[];
      escalationEmail?: string;
    };
    generatedFiles: Array<{
      path: string;
      content: string;
    }>;
    recommendedNextSteps: string[];
  };
}

const DEFAULT_USE_CASE =
  "Adapt this template to our workflows, escalation policy, and tool stack.";

const TONE_LABELS: Record<CustomizationTone, string> = {
  professional: "Professional",
  friendly: "Friendly",
  technical: "Technical",
  concise: "Concise"
};

const RISK_LABELS: Record<CustomizationRiskTolerance, string> = {
  low: "Low autonomy",
  medium: "Balanced",
  high: "High autonomy"
};

const TOOL_LABELS: Record<CustomizationTool, string> = {
  slack: "Slack",
  zendesk: "Zendesk",
  intercom: "Intercom",
  github: "GitHub",
  notion: "Notion",
  gmail: "Gmail",
  stripe: "Stripe"
};

function defaultToolsForTemplate(title: string): CustomizationTool[] {
  const normalized = title.toLowerCase();

  if (normalized.includes("support")) {
    return ["slack", "zendesk"];
  }

  if (normalized.includes("code")) {
    return ["github", "slack"];
  }

  if (normalized.includes("content")) {
    return ["notion", "gmail"];
  }

  return ["slack"];
}

export function CustomizationWizardForm({
  templateSlug,
  templateTitle,
  frameworks
}: CustomizationWizardFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [useCase, setUseCase] = useState(DEFAULT_USE_CASE);
  const [tone, setTone] = useState<CustomizationTone>("friendly");
  const [riskTolerance, setRiskTolerance] =
    useState<CustomizationRiskTolerance>("medium");
  const [deploymentTarget, setDeploymentTarget] = useState<TemplateFramework>(
    frameworks[0] ?? "claude-code"
  );
  const [tools, setTools] = useState<CustomizationTool[]>(() =>
    defaultToolsForTemplate(templateTitle)
  );
  const [escalationEmail, setEscalationEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CustomizationResponse | null>(null);

  const deploymentOptions = useMemo(
    () => (frameworks.length > 0 ? frameworks : (["claude-code"] as const)),
    [frameworks]
  );

  function toggleTool(tool: CustomizationTool): void {
    setTools((currentTools) => {
      if (currentTools.includes(tool)) {
        return currentTools.filter((entry) => entry !== tool);
      }

      if (currentTools.length >= 5) {
        return currentTools;
      }

      return [...currentTools, tool];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (tools.length === 0) {
      setError("Select at least one tool to generate a configuration package.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/templates/${templateSlug}/customize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          useCase,
          tone,
          riskTolerance,
          deploymentTarget,
          tools,
          escalationEmail
        })
      });
      const payload = (await response.json().catch(() => null)) as
        | CustomizationResponse
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(payload && "error" in payload ? payload.error ?? "Request failed." : "Request failed.");
        return;
      }

      setResult(payload as CustomizationResponse);
    } catch {
      setError("Could not generate customization package.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="wizard-stack">
      <form className="checkout-form wizard-form" onSubmit={handleSubmit}>
        <label>
          Company name
          <input
            value={companyName}
            onChange={(event) => setCompanyName(event.currentTarget.value)}
            placeholder="Acme Labs"
            minLength={2}
            maxLength={80}
            required
          />
        </label>

        <label>
          Primary use case
          <textarea
            value={useCase}
            onChange={(event) => setUseCase(event.currentTarget.value)}
            minLength={12}
            maxLength={240}
            required
          />
        </label>

        <label>
          Tone
          <select
            value={tone}
            onChange={(event) =>
              setTone(event.currentTarget.value as CustomizationTone)
            }
          >
            {CUSTOMIZATION_TONE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {TONE_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Risk policy
          <select
            value={riskTolerance}
            onChange={(event) =>
              setRiskTolerance(
                event.currentTarget.value as CustomizationRiskTolerance
              )
            }
          >
            {CUSTOMIZATION_RISK_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {RISK_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Deployment target
          <select
            value={deploymentTarget}
            onChange={(event) =>
              setDeploymentTarget(event.currentTarget.value as TemplateFramework)
            }
          >
            {deploymentOptions.map((framework) => (
              <option key={framework} value={framework}>
                {framework}
              </option>
            ))}
          </select>
        </label>

        <label>
          Escalation email (optional)
          <input
            type="email"
            value={escalationEmail}
            onChange={(event) => setEscalationEmail(event.currentTarget.value)}
            placeholder="ops@acme.dev"
          />
        </label>

        <fieldset className="filter-group wizard-tool-fieldset">
          <legend>Connected tools (max 5)</legend>
          <div className="checkbox-list wizard-tool-list">
            {CUSTOMIZATION_TOOL_OPTIONS.map((tool) => (
              <label key={tool} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={tools.includes(tool)}
                  onChange={() => toggleTool(tool)}
                />
                <span>{TOOL_LABELS[tool]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Generating package..." : "Generate customization package"}
        </button>
      </form>

      {error ? <p className="error-message">{error}</p> : null}

      {result ? (
        <section className="detail-panel wizard-output" aria-live="polite">
          <h3>Customization package ready</h3>
          <p className="muted">
            Package <code>{result.customization.packageName}</code> generated on{" "}
            {new Date(result.customization.generatedAt).toLocaleString()}.
          </p>
          <p className="muted">
            Target framework: {result.customization.profile.deploymentTarget}
          </p>
          <div className="preview-grid">
            {result.customization.generatedFiles.map((file) => (
              <article key={file.path} className="preview-card">
                <h3>{file.path}</h3>
                <pre>{file.content}</pre>
              </article>
            ))}
          </div>
          <div className="wizard-next-steps">
            <h3>Next steps</h3>
            <ul>
              {result.customization.recommendedNextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
