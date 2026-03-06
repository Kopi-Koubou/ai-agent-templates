import { beforeEach, describe, expect, test } from "vitest";

import {
  buildPurchaseLicensePreview,
  clearPurchaseStoreForTests,
  createPurchase,
  getPurchaseByToken,
  listPurchasesByEmail,
  recordDownload,
  refreshPurchaseDownloadToken
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
    expect(purchase.paymentMethod).toBe("card");
    expect(purchase.receiptId).toMatch(/^rcpt_/);
    expect(purchase.receiptSentAt).toBeDefined();

    const license = buildPurchaseLicensePreview(purchase);
    expect(license.model).toBe("per-user");
    expect(license.projects).toBe("unlimited");
    expect(license.transferability).toBe("non-transferable");
    expect(license.holderEmail).toBe("builder@example.com");
    expect(license.summary).toContain("unlimited projects");

    const retrieved = getPurchaseByToken(purchase.token);
    expect(retrieved?.templateSlug).toBe("supportbot-pro");
    expect(retrieved?.email).toBe("builder@example.com");
  });

  test("tracks download count by token", () => {
    const purchase = createPurchase("supportbot-pro", "builder@example.com");
    const updated = recordDownload(purchase.token);

    expect(updated?.downloadCount).toBe(1);
    expect(updated?.lastDownloadedAt).toBeDefined();
    expect(updated?.downloadHistory).toHaveLength(1);
  });

  test("caps download history to recent entries", () => {
    const purchase = createPurchase("supportbot-pro", "builder@example.com");
    let updated = recordDownload(purchase.token);

    for (let index = 0; index < 12; index += 1) {
      updated = recordDownload(purchase.token);
    }

    expect(updated?.downloadCount).toBe(13);
    expect(updated?.downloadHistory).toHaveLength(10);
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

  test("keeps expired purchases in history while download token expires", () => {
    const purchase = createPurchase("supportbot-pro", "builder@example.com");
    purchase.expiresAt = "2000-01-01T00:00:00.000Z";

    expect(getPurchaseByToken(purchase.token)).toBeNull();
    expect(recordDownload(purchase.token)).toBeNull();

    const history = listPurchasesByEmail("builder@example.com");
    expect(history).toHaveLength(1);
    expect(history[0]?.token).toBe(purchase.token);
  });

  test("refreshes expired download token for the owning buyer", () => {
    const purchase = createPurchase("supportbot-pro", "builder@example.com");
    purchase.expiresAt = "2000-01-01T00:00:00.000Z";

    const refreshed = refreshPurchaseDownloadToken(
      purchase.token,
      "builder@example.com"
    );

    expect(refreshed).not.toBeNull();
    expect(refreshed?.token).not.toBe(purchase.token);
    expect(Date.parse(refreshed!.expiresAt)).toBeGreaterThan(Date.now());
    expect(getPurchaseByToken(purchase.token)).toBeNull();
    expect(getPurchaseByToken(refreshed!.token)?.token).toBe(refreshed!.token);
  });

  test("throws when template slug is invalid", () => {
    expect(() => createPurchase("missing-template", "x@example.com")).toThrow(
      /Template not found/
    );
  });

  test("stores explicit payment method overrides", () => {
    const purchase = createPurchase(
      "supportbot-pro",
      "builder@example.com",
      "google-pay"
    );

    expect(purchase.paymentMethod).toBe("google-pay");
  });
});
