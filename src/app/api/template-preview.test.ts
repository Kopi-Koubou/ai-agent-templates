import { describe, expect, test } from "vitest";

import { GET as previewRoute } from "@/app/api/templates/[slug]/preview/route";
import { GET as starterRoute } from "@/app/api/templates/[slug]/starter/route";

describe("template preview and starter APIs", () => {
  test("returns generated preview content", async () => {
    const response = await previewRoute(
      new Request("http://localhost/api/templates/supportbot-pro/preview"),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      preview: {
        fileTree: string[];
        starterAvailable: boolean;
        screenshotUrls: string[];
      };
    };

    expect(payload.preview.fileTree).toContain("README.md");
    expect(payload.preview.starterAvailable).toBe(true);
    expect(payload.preview.screenshotUrls).toHaveLength(3);
    expect(payload.preview.screenshotUrls[0]).toContain("supportbot-pro-overview");
  });

  test("returns starter package metadata for free templates", async () => {
    const response = await starterRoute(
      new Request("http://localhost/api/templates/supportbot-pro/starter"),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { starterPackagePath: string };
    expect(payload.starterPackagePath).toContain("supportbot-pro-starter.zip");
  });

  test("rejects starter requests when template is not free", async () => {
    const response = await starterRoute(
      new Request("http://localhost/api/templates/leadenricher/starter"),
      { params: Promise.resolve({ slug: "leadenricher" }) }
    );

    expect(response.status).toBe(404);
  });
});
