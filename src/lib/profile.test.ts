import { describe, expect, test } from "vitest";

import { buildBuyerProfile, getDisplayNameFromEmail } from "@/lib/profile";
import { PurchaseRecord } from "@/lib/purchase-store";

function makePurchase(overrides: Partial<PurchaseRecord>): PurchaseRecord {
  return {
    token: "token",
    orderId: "ord_123",
    templateSlug: "supportbot-pro",
    templateTitle: "SupportBot Pro",
    purchasedVersion: "1.2.0",
    email: "builder@example.com",
    purchasedAt: "2026-02-10T12:00:00.000Z",
    expiresAt: "2026-03-12T12:00:00.000Z",
    downloadCount: 0,
    downloadHistory: [],
    receiptId: "rcpt_123",
    receiptSentAt: "2026-02-10T12:00:00.000Z",
    ...overrides
  };
}

describe("profile helpers", () => {
  test("builds display names from email local-part", () => {
    expect(getDisplayNameFromEmail("builder.ops@example.com")).toBe(
      "Builder Ops"
    );
    expect(getDisplayNameFromEmail("___@example.com")).toBe("Buyer");
  });

  test("builds profile with earliest purchase as join date", () => {
    const purchases = [
      makePurchase({ purchasedAt: "2026-02-11T12:00:00.000Z" }),
      makePurchase({ purchasedAt: "2026-02-01T09:30:00.000Z", token: "token_2" })
    ];

    const profile = buildBuyerProfile(
      "Builder.Ops@Example.com",
      purchases,
      ["supportbot-pro", "contentpipeline"]
    );

    expect(profile.email).toBe("builder.ops@example.com");
    expect(profile.displayName).toBe("Builder Ops");
    expect(profile.joinedAt).toBe("2026-02-01T09:30:00.000Z");
    expect(profile.purchasesCount).toBe(2);
    expect(profile.favoritesCount).toBe(2);
  });
});
