import { z } from "zod";

import { Template, TemplateFramework } from "@/lib/types";

export const CUSTOMIZATION_TONE_OPTIONS = [
  "professional",
  "friendly",
  "technical",
  "concise"
] as const;
export type CustomizationTone = (typeof CUSTOMIZATION_TONE_OPTIONS)[number];

export const CUSTOMIZATION_RISK_OPTIONS = ["low", "medium", "high"] as const;
export type CustomizationRiskTolerance =
  (typeof CUSTOMIZATION_RISK_OPTIONS)[number];

export const CUSTOMIZATION_TOOL_OPTIONS = [
  "slack",
  "zendesk",
  "intercom",
  "github",
  "notion",
  "gmail",
  "stripe"
] as const;
export type CustomizationTool = (typeof CUSTOMIZATION_TOOL_OPTIONS)[number];

export const templateCustomizationInputSchema = z
  .object({
    companyName: z.string().trim().min(2).max(80),
    useCase: z.string().trim().min(12).max(240),
    tone: z.enum(CUSTOMIZATION_TONE_OPTIONS),
    riskTolerance: z.enum(CUSTOMIZATION_RISK_OPTIONS),
    deploymentTarget: z.enum(["openclaw", "claude-code", "langgraph", "crewai"]),
    tools: z.array(z.enum(CUSTOMIZATION_TOOL_OPTIONS)).min(1).max(5),
    escalationEmail: z
      .string()
      .trim()
      .email()
      .optional()
      .or(z.literal(""))
  })
  .transform((payload) => ({
    ...payload,
    companyName: payload.companyName.trim(),
    useCase: payload.useCase.trim(),
    tools: Array.from(new Set(payload.tools)),
    escalationEmail:
      payload.escalationEmail && payload.escalationEmail.trim().length > 0
        ? payload.escalationEmail.trim().toLowerCase()
        : undefined
  }));

export type TemplateCustomizationInput = z.infer<
  typeof templateCustomizationInputSchema
>;

interface TemplateCustomizationProfile {
  companyName: string;
  useCase: string;
  tone: CustomizationTone;
  riskTolerance: CustomizationRiskTolerance;
  deploymentTarget: TemplateFramework;
  tools: CustomizationTool[];
  escalationEmail?: string;
}

interface GeneratedTemplateFile {
  path: string;
  content: string;
}

export interface TemplateCustomizationPackage {
  packageName: string;
  templateSlug: string;
  templateTitle: string;
  generatedAt: string;
  profile: TemplateCustomizationProfile;
  generatedFiles: GeneratedTemplateFile[];
  recommendedNextSteps: string[];
}

function toSlugSegment(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "team";
}

function formatToneGuidance(tone: CustomizationTone): string {
  switch (tone) {
    case "professional":
      return "Use concise, confident language and avoid slang.";
    case "friendly":
      return "Stay warm and conversational while preserving clear action steps.";
    case "technical":
      return "Prioritize precise terminology, assumptions, and implementation details.";
    case "concise":
      return "Keep responses brief, direct, and outcome focused.";
    default:
      return "Balance clarity and brevity in every response.";
  }
}

function formatRiskGuidance(riskTolerance: CustomizationRiskTolerance): string {
  switch (riskTolerance) {
    case "low":
      return "Escalate early, avoid autonomous high-impact actions, and require confirmation for policy-sensitive tasks.";
    case "medium":
      return "Allow autonomous low-risk tasks with explicit confidence checks before external actions.";
    case "high":
      return "Allow broader autonomous execution, but preserve audit logs and explicit rollback guidance.";
    default:
      return "Use balanced guardrails and escalation criteria.";
  }
}

function resolveDeploymentTarget(
  template: Template,
  requestedTarget: TemplateFramework
): TemplateFramework {
  if (template.frameworks.includes(requestedTarget)) {
    return requestedTarget;
  }

  return template.frameworks[0] ?? requestedTarget;
}

function buildGeneratedFiles(
  template: Template,
  profile: TemplateCustomizationProfile
): GeneratedTemplateFile[] {
  const soul = [
    "# SOUL.md",
    "",
    `You are the ${template.title} agent for ${profile.companyName}.`,
    `Primary mission: ${profile.useCase}`,
    "",
    "## Voice and behavior",
    formatToneGuidance(profile.tone),
    "",
    "## Escalation",
    profile.escalationEmail
      ? `Escalate unresolved or high-risk requests to ${profile.escalationEmail}.`
      : "Escalate unresolved or high-risk requests to a human operator channel."
  ].join("\n");

  const identity = [
    "# IDENTITY.md",
    "",
    `Category: ${template.category}`,
    `Complexity: ${template.complexity}`,
    `Deployment target: ${profile.deploymentTarget}`,
    "",
    "## Scope",
    profile.useCase,
    "",
    "## Guardrail policy",
    formatRiskGuidance(profile.riskTolerance)
  ].join("\n");

  const toolConfig = JSON.stringify(
    {
      company: profile.companyName,
      deploymentTarget: profile.deploymentTarget,
      tools: profile.tools.map((tool) => ({
        id: tool,
        enabled: true,
        timeoutMs: 8000,
        retry: profile.riskTolerance === "low" ? 1 : 2
      }))
    },
    null,
    2
  );

  const customize = [
    "# CUSTOMIZE.md",
    "",
    `1. Replace environment secrets for ${profile.companyName}.`,
    "2. Validate tool credentials and OAuth scopes.",
    "3. Run tests under `tests/` with your own domain examples.",
    `4. Confirm escalation routing${profile.escalationEmail ? ` to ${profile.escalationEmail}` : ""}.`,
    "5. Deploy to staging and review logs before production."
  ].join("\n");

  return [
    { path: "SOUL.md", content: soul },
    { path: "IDENTITY.md", content: identity },
    { path: "tools/tool-configs.json", content: toolConfig },
    { path: "CUSTOMIZE.md", content: customize }
  ];
}

export function buildTemplateCustomizationPackage(
  template: Template,
  input: TemplateCustomizationInput
): TemplateCustomizationPackage {
  const deploymentTarget = resolveDeploymentTarget(
    template,
    input.deploymentTarget
  );
  const companySlug = toSlugSegment(input.companyName);
  const packageName = `${template.slug}-${companySlug}-customization`;

  const profile: TemplateCustomizationProfile = {
    companyName: input.companyName,
    useCase: input.useCase,
    tone: input.tone,
    riskTolerance: input.riskTolerance,
    deploymentTarget,
    tools: input.tools,
    escalationEmail: input.escalationEmail
  };

  return {
    packageName,
    templateSlug: template.slug,
    templateTitle: template.title,
    generatedAt: new Date().toISOString(),
    profile,
    generatedFiles: buildGeneratedFiles(template, profile),
    recommendedNextSteps: [
      "Apply generated SOUL.md and IDENTITY.md values into your purchased template.",
      "Map each enabled tool id to a real service credential in your deployment environment.",
      "Run the provided regression tests before production launch."
    ]
  };
}
