import { describe, expect, test } from "vitest";

import { POST as customizeRoute } from "@/app/api/templates/[slug]/customize/route";

interface CustomizeResponse {
  templateSlug: string;
  templateTitle: string;
  customization: {
    packageName: string;
    generatedFiles: Array<{ path: string; content: string }>;
  };
}

describe("customization API flow", () => {
  test("returns generated customization artifacts for valid payloads", async () => {
    const response = await customizeRoute(
      new Request("http://localhost/api/templates/supportbot-pro/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: "Acme Labs",
          useCase: "Handle inbound support tickets and escalation triage.",
          tone: "friendly",
          riskTolerance: "medium",
          deploymentTarget: "openclaw",
          tools: ["slack", "zendesk"],
          escalationEmail: "ops@acme.dev"
        })
      }),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as CustomizeResponse;

    expect(payload.templateSlug).toBe("supportbot-pro");
    expect(payload.customization.packageName).toBe(
      "supportbot-pro-acme-labs-customization"
    );
    expect(payload.customization.generatedFiles).toHaveLength(4);
    expect(payload.customization.generatedFiles[0]?.path).toBe("SOUL.md");
  });

  test("returns validation errors for malformed wizard payloads", async () => {
    const response = await customizeRoute(
      new Request("http://localhost/api/templates/supportbot-pro/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: "A",
          useCase: "Too short",
          tone: "friendly",
          riskTolerance: "medium",
          deploymentTarget: "openclaw",
          tools: []
        })
      }),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );

    expect(response.status).toBe(400);
  });

  test("returns not found for unknown template slugs", async () => {
    const response = await customizeRoute(
      new Request("http://localhost/api/templates/missing/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: "Acme Labs",
          useCase: "Handle inbound support tickets and escalation triage.",
          tone: "friendly",
          riskTolerance: "medium",
          deploymentTarget: "openclaw",
          tools: ["slack"]
        })
      }),
      { params: Promise.resolve({ slug: "missing" }) }
    );

    expect(response.status).toBe(404);
  });
});
