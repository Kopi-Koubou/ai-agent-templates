import { describe, expect, test } from "vitest";

import { templates } from "@/data/templates";
import {
  buildTemplateCustomizationPackage,
  templateCustomizationInputSchema
} from "@/lib/customization";

describe("template customization helpers", () => {
  test("normalizes payload input and deduplicates selected tools", () => {
    const parsed = templateCustomizationInputSchema.parse({
      companyName: "  Acme Labs  ",
      useCase: "Handle inbound support tickets and escalation triage.",
      tone: "friendly",
      riskTolerance: "medium",
      deploymentTarget: "openclaw",
      tools: ["slack", "zendesk", "slack"],
      escalationEmail: "  OPS@acme.dev "
    });

    expect(parsed.companyName).toBe("Acme Labs");
    expect(parsed.tools).toEqual(["slack", "zendesk"]);
    expect(parsed.escalationEmail).toBe("ops@acme.dev");
  });

  test("builds customization package output with generated files", () => {
    const template = templates.find((entry) => entry.slug === "supportbot-pro");
    expect(template).toBeDefined();

    const parsed = templateCustomizationInputSchema.parse({
      companyName: "Acme Labs",
      useCase: "Handle inbound support tickets and escalation triage.",
      tone: "professional",
      riskTolerance: "low",
      deploymentTarget: "openclaw",
      tools: ["slack", "zendesk"],
      escalationEmail: "ops@acme.dev"
    });

    const customization = buildTemplateCustomizationPackage(template!, parsed);

    expect(customization.templateSlug).toBe("supportbot-pro");
    expect(customization.packageName).toBe(
      "supportbot-pro-acme-labs-customization"
    );
    expect(customization.generatedFiles).toHaveLength(4);
    expect(customization.generatedFiles[0]?.path).toBe("SOUL.md");
    expect(customization.generatedFiles[0]?.content).toContain("Acme Labs");
    expect(customization.generatedFiles[2]?.path).toBe("tools/tool-configs.json");
  });

  test("falls back deployment target when template does not support requested target", () => {
    const template = templates.find((entry) => entry.slug === "supportbot-pro");
    expect(template).toBeDefined();

    const parsed = templateCustomizationInputSchema.parse({
      companyName: "Acme Labs",
      useCase: "Handle inbound support tickets and escalation triage.",
      tone: "concise",
      riskTolerance: "high",
      deploymentTarget: "langgraph",
      tools: ["slack"]
    });

    const customization = buildTemplateCustomizationPackage(template!, parsed);
    expect(customization.profile.deploymentTarget).toBe("claude-code");
  });
});
