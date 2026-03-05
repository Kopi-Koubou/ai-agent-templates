import { beforeEach, describe, expect, test } from "vitest";

import { createBundlePurchase } from "@/lib/bundle-store";
import { clearPurchaseStoreForTests, listPurchasesByEmail } from "@/lib/purchase-store";

describe("bundle store", () => {
  beforeEach(() => {
    clearPurchaseStoreForTests();
  });

  test("creates purchases for every template in a bundle", () => {
    const result = createBundlePurchase(
      "agency-starter-kit",
      "Builder@example.com"
    );

    expect(result.bundleOrderId).toMatch(/^bord_/);
    expect(result.bundleSlug).toBe("agency-starter-kit");
    expect(result.email).toBe("builder@example.com");
    expect(result.templateCount).toBe(4);
    expect(result.items).toHaveLength(4);
    expect(result.items[0]?.downloadPath).toContain("/api/download/");
    expect(result.items.every((item) => item.license.model === "per-user")).toBe(
      true
    );

    const purchaseHistory = listPurchasesByEmail("builder@example.com");
    expect(purchaseHistory).toHaveLength(4);
  });

  test("throws for unknown bundle slugs", () => {
    expect(() =>
      createBundlePurchase("unknown-bundle", "builder@example.com")
    ).toThrow(/Bundle not found/);
  });
});
