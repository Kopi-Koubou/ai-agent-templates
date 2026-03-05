import { beforeEach, describe, expect, test } from "vitest";

import { POST as purchaseRoute } from "@/app/api/purchase/route";
import { GET as updatesRoute } from "@/app/api/updates/route";
import { templates } from "@/data/templates";
import { clearPurchaseStoreForTests } from "@/lib/purchase-store";

interface UpdatesResponse {
  count: number;
  notifications: Array<{
    templateSlug: string;
    purchasedVersion: string;
    latestVersion: string;
  }>;
}

describe("updates API flow", () => {
  beforeEach(() => {
    clearPurchaseStoreForTests();
  });

  test("returns template update notifications for authenticated buyers", async () => {
    const template = templates.find((entry) => entry.slug === "supportbot-pro");
    expect(template).toBeDefined();
    const originalVersion = template!.version;

    try {
      await purchaseRoute(
        new Request("http://localhost/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateSlug: "supportbot-pro",
            email: "builder@example.com"
          })
        })
      );

      template!.version = "1.3.0";

      const updatesResponse = await updatesRoute(
        new Request("http://localhost/api/updates", {
          headers: {
            cookie: "agentvault_buyer_email=builder%40example.com"
          }
        })
      );
      expect(updatesResponse.status).toBe(200);

      const payload = (await updatesResponse.json()) as UpdatesResponse;
      expect(payload.count).toBe(1);
      expect(payload.notifications[0]?.templateSlug).toBe("supportbot-pro");
      expect(payload.notifications[0]?.purchasedVersion).toBe(originalVersion);
      expect(payload.notifications[0]?.latestVersion).toBe("1.3.0");
    } finally {
      template!.version = originalVersion;
    }
  });

  test("rejects updates requests without auth cookie", async () => {
    const response = await updatesRoute(
      new Request("http://localhost/api/updates")
    );

    expect(response.status).toBe(401);
  });
});
