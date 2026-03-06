import { beforeEach, describe, expect, test } from "vitest";

import { GET as bundleRoute } from "@/app/api/bundles/[slug]/route";
import { POST as bundlePurchaseRoute } from "@/app/api/bundles/[slug]/purchase/route";
import { GET as bundlesRoute } from "@/app/api/bundles/route";
import { GET as purchasesRoute } from "@/app/api/purchases/route";
import { clearPurchaseStoreForTests } from "@/lib/purchase-store";

interface BundlesResponse {
  count: number;
  bundles: Array<{ slug: string }>;
}

interface BundleResponse {
  slug: string;
  templates: Array<{ slug: string }>;
  pricing: {
    bundlePriceCents: number;
  };
}

interface BundlePurchaseResponse {
  bundleOrderId: string;
  bundleSlug: string;
  paymentMethod: "card" | "apple-pay" | "google-pay";
  templateCount: number;
  items: Array<{
    token: string;
    downloadPath: string;
    paymentMethod: "card" | "apple-pay" | "google-pay";
  }>;
}

interface PurchasesResponse {
  count: number;
}

describe("bundle API flow", () => {
  beforeEach(() => {
    clearPurchaseStoreForTests();
  });

  test("lists bundles and returns detail for a published bundle", async () => {
    const listResponse = await bundlesRoute();
    expect(listResponse.status).toBe(200);

    const listPayload = (await listResponse.json()) as BundlesResponse;
    expect(listPayload.count).toBeGreaterThan(0);
    expect(listPayload.bundles.some((bundle) => bundle.slug === "agency-starter-kit")).toBe(
      true
    );

    const detailResponse = await bundleRoute(
      new Request("http://localhost/api/bundles/agency-starter-kit"),
      { params: Promise.resolve({ slug: "agency-starter-kit" }) }
    );
    expect(detailResponse.status).toBe(200);

    const detailPayload = (await detailResponse.json()) as BundleResponse;
    expect(detailPayload.slug).toBe("agency-starter-kit");
    expect(detailPayload.templates).toHaveLength(4);
    expect(detailPayload.pricing.bundlePriceCents).toBe(27900);
  });

  test("creates a bundle purchase and surfaces purchases in buyer history", async () => {
    const buyerEmail = "builder@example.com";
    const purchaseResponse = await bundlePurchaseRoute(
      new Request("http://localhost/api/bundles/agency-starter-kit/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: buyerEmail,
          paymentMethod: "google-pay"
        })
      }),
      { params: Promise.resolve({ slug: "agency-starter-kit" }) }
    );
    expect(purchaseResponse.status).toBe(200);

    const purchasePayload = (await purchaseResponse.json()) as BundlePurchaseResponse;
    expect(purchasePayload.bundleOrderId).toMatch(/^bord_/);
    expect(purchasePayload.bundleSlug).toBe("agency-starter-kit");
    expect(purchasePayload.paymentMethod).toBe("google-pay");
    expect(purchasePayload.templateCount).toBe(4);
    expect(purchasePayload.items).toHaveLength(4);
    expect(
      purchasePayload.items.every((item) =>
        item.downloadPath.startsWith("/api/download/") &&
        item.paymentMethod === "google-pay"
      )
    ).toBe(true);

    const purchasesResponse = await purchasesRoute(
      new Request("http://localhost/api/purchases", {
        headers: {
          cookie: `agentvault_buyer_email=${encodeURIComponent(buyerEmail)}`
        }
      })
    );
    expect(purchasesResponse.status).toBe(200);

    const purchasesPayload = (await purchasesResponse.json()) as PurchasesResponse;
    expect(purchasesPayload.count).toBe(4);
  });

  test("returns not found for missing bundle slugs", async () => {
    const response = await bundleRoute(
      new Request("http://localhost/api/bundles/missing"),
      { params: Promise.resolve({ slug: "missing" }) }
    );

    expect(response.status).toBe(404);
  });
});
