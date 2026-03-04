import { beforeEach, describe, expect, test } from "vitest";

import {
  clearPurchaseStoreForTests,
  createPurchase,
  getPurchaseByToken,
  listPurchasesByEmail,
  recordDownload
} from "@/lib/purchase-store";

describe("purchase store", () => {
  beforeEach(() => {
    clearPurchaseStoreForTests();
  });

  test("creates and retrieves purchase records", () => {
    const purchase = createPurchase("supportbot-pro", "builder@example.com");

    expect(purchase.orderId).toMatch(/^ord_/);
    expect(purchase.token.length).toBeGreaterThan(20);
    expect(purchase.purchasedVersion).toBe("1.2.0");
    expect(purchase.downloadCount).toBe(0);
    expect(purchase.receiptId).toMatch(/^rcpt_/);
    expect(purchase.receiptSentAt).toBeDefined();

    const retrieved = getPurchaseByToken(purchase.token);
    expect(retrieved?.templateSlug).toBe("supportbot-pro");
    expect(retrieved?.email).toBe("builder@example.com");
  });

  test("tracks download count by token", () => {
    const purchase = createPurchase("supportbot-pro", "builder@example.com");
    const updated = recordDownload(purchase.token);

    expect(updated?.downloadCount).toBe(1);
    expect(updated?.lastDownloadedAt).toBeDefined();
  });

  test("lists purchases by buyer email", () => {
    createPurchase("supportbot-pro", "builder@example.com");
    createPurchase("contentpipeline", "other@example.com");
    createPurchase("leadenricher", "builder@example.com");

    const history = listPurchasesByEmail("builder@example.com");
    expect(history).toHaveLength(2);
    expect(history.every((entry) => entry.email === "builder@example.com")).toBe(
      true
    );
  });

  test("throws when template slug is invalid", () => {
    expect(() => createPurchase("missing-template", "x@example.com")).toThrow(
      /Template not found/
    );
  });
});
