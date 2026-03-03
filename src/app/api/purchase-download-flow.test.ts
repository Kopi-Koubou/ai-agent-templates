import { beforeEach, describe, expect, test } from "vitest";

import { GET as downloadRoute } from "@/app/api/download/[token]/route";
import { POST as purchaseRoute } from "@/app/api/purchase/route";
import { GET as purchasesRoute } from "@/app/api/purchases/route";
import { clearPurchaseStoreForTests } from "@/lib/purchase-store";

interface PurchaseResponse {
  token: string;
  orderId: string;
  downloadPath: string;
}

interface DownloadResponse {
  template: string;
  downloadCount: number;
}

interface PurchasesResponse {
  count: number;
  purchases: Array<{ templateSlug: string; purchasedVersion: string }>;
}

describe("purchase and download API flow", () => {
  beforeEach(() => {
    clearPurchaseStoreForTests();
  });

  test("creates a purchase, validates download, and returns buyer history", async () => {
    const buyerEmail = "builder@example.com";
    const createResponse = await purchaseRoute(
      new Request("http://localhost/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSlug: "supportbot-pro",
          email: buyerEmail
        })
      })
    );

    expect(createResponse.status).toBe(200);
    const purchase = (await createResponse.json()) as PurchaseResponse;
    expect(purchase.orderId).toMatch(/^ord_/);
    expect(purchase.downloadPath).toBe(`/api/download/${purchase.token}`);

    const downloadResponse = await downloadRoute(
      new Request(`http://localhost/api/download/${purchase.token}`),
      { params: Promise.resolve({ token: purchase.token }) }
    );
    expect(downloadResponse.status).toBe(200);

    const download = (await downloadResponse.json()) as DownloadResponse;
    expect(download.template).toBe("SupportBot Pro");
    expect(download.downloadCount).toBe(1);

    const historyResponse = await purchasesRoute(
      new Request("http://localhost/api/purchases", {
        headers: {
          cookie: `agentvault_buyer_email=${encodeURIComponent(buyerEmail)}`
        }
      })
    );
    expect(historyResponse.status).toBe(200);

    const history = (await historyResponse.json()) as PurchasesResponse;
    expect(history.count).toBe(1);
    expect(history.purchases[0]?.templateSlug).toBe("supportbot-pro");
    expect(history.purchases[0]?.purchasedVersion).toBe("1.2.0");
  });

  test("rejects purchase-history access without auth cookie", async () => {
    const response = await purchasesRoute(
      new Request("http://localhost/api/purchases")
    );

    expect(response.status).toBe(401);
  });
});
