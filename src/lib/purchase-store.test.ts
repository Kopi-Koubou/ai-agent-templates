import { beforeEach, describe, expect, test } from "vitest";

import {
  clearPurchaseStoreForTests,
  createPurchase,
  getPurchaseByToken
} from "@/lib/purchase-store";

describe("purchase store", () => {
  beforeEach(() => {
    clearPurchaseStoreForTests();
  });

  test("creates and retrieves purchase records", () => {
    const purchase = createPurchase("supportbot-pro", "builder@example.com");

    expect(purchase.orderId).toMatch(/^ord_/);
    expect(purchase.token.length).toBeGreaterThan(20);

    const retrieved = getPurchaseByToken(purchase.token);
    expect(retrieved?.templateSlug).toBe("supportbot-pro");
    expect(retrieved?.email).toBe("builder@example.com");
  });

  test("throws when template slug is invalid", () => {
    expect(() => createPurchase("missing-template", "x@example.com")).toThrow(
      /Template not found/
    );
  });
});
