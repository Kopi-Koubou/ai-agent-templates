import { beforeEach, describe, expect, test } from "vitest";

import { templates } from "@/data/templates";
import { clearPurchaseStoreForTests, createPurchase } from "@/lib/purchase-store";
import {
  compareTemplateVersions,
  listTemplateUpdateNotifications
} from "@/lib/update-notifications";

describe("template update notifications", () => {
  beforeEach(() => {
    clearPurchaseStoreForTests();
  });

  test("compares semantic versions", () => {
    expect(compareTemplateVersions("1.2.0", "1.2.0")).toBe(0);
    expect(compareTemplateVersions("1.3.0", "1.2.9")).toBeGreaterThan(0);
    expect(compareTemplateVersions("2.0.0", "2.1.0")).toBeLessThan(0);
  });

  test("lists update notifications when a newer template version exists", () => {
    const template = templates.find((entry) => entry.slug === "supportbot-pro");
    expect(template).toBeDefined();
    const originalVersion = template!.version;

    try {
      createPurchase("supportbot-pro", "builder@example.com");
      template!.version = "1.3.0";

      const notifications = listTemplateUpdateNotifications(
        "builder@example.com"
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]?.templateSlug).toBe("supportbot-pro");
      expect(notifications[0]?.purchasedVersion).toBe(originalVersion);
      expect(notifications[0]?.latestVersion).toBe("1.3.0");
      expect(notifications[0]?.latestReleaseNotes).toContain("Current production release");
    } finally {
      template!.version = originalVersion;
    }
  });

  test("returns no notifications when purchases are already on latest version", () => {
    createPurchase("supportbot-pro", "builder@example.com");

    const notifications = listTemplateUpdateNotifications("builder@example.com");
    expect(notifications).toEqual([]);
  });
});
