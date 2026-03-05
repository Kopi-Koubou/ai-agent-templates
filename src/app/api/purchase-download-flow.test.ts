import { beforeEach, describe, expect, test } from "vitest";

import { GET as downloadRoute } from "@/app/api/download/[token]/route";
import { POST as purchaseRoute } from "@/app/api/purchase/route";
import { GET as purchasesRoute } from "@/app/api/purchases/route";
import {
  clearPurchaseStoreForTests,
  getPurchaseByToken
} from "@/lib/purchase-store";

interface PurchaseResponse {
  token: string;
  orderId: string;
  downloadPath: string;
  expiresAt: string;
  license: {
    model: "per-user";
    projects: "unlimited";
    transferability: "non-transferable";
    holderEmail: string;
    grantedAt: string;
    summary: string;
  };
  receipt: {
    id: string;
    to: string;
    sentAt: string;
    subject: string;
    delivery: "mock-queued";
    downloadPath: string;
    expiresAt: string;
    previewText: string;
  };
}

interface DownloadResponse {
  template: string;
  token: string;
  downloadCount: number;
  downloadedAt?: string;
  downloadHistory: string[];
  downloadPath: string;
  refreshedLink: boolean;
  license: {
    model: "per-user";
    projects: "unlimited";
    transferability: "non-transferable";
    holderEmail: string;
    grantedAt: string;
    summary: string;
  };
}

interface PurchasesResponse {
  count: number;
  purchases: Array<{
    token: string;
    templateSlug: string;
    purchasedVersion: string;
  }>;
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
    expect(purchase.receipt.id).toMatch(/^rcpt_/);
    expect(purchase.receipt.to).toBe(buyerEmail);
    expect(purchase.receipt.downloadPath).toBe(purchase.downloadPath);
    expect(purchase.receipt.expiresAt).toBe(purchase.expiresAt);
    expect(purchase.license.model).toBe("per-user");
    expect(purchase.license.projects).toBe("unlimited");
    expect(purchase.license.transferability).toBe("non-transferable");
    expect(purchase.license.holderEmail).toBe(buyerEmail);
    expect(purchase.license.summary).toContain("Per-user license");

    const downloadResponse = await downloadRoute(
      new Request(`http://localhost/api/download/${purchase.token}`),
      { params: Promise.resolve({ token: purchase.token }) }
    );
    expect(downloadResponse.status).toBe(200);

    const download = (await downloadResponse.json()) as DownloadResponse;
    expect(download.template).toBe("SupportBot Pro");
    expect(download.downloadCount).toBe(1);
    expect(download.downloadedAt).toBeDefined();
    expect(download.downloadHistory).toHaveLength(1);
    expect(download.license.model).toBe("per-user");
    expect(download.license.projects).toBe("unlimited");
    expect(download.license.transferability).toBe("non-transferable");
    expect(download.license.holderEmail).toBe(buyerEmail);

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

  test("renews an expired download link for the authenticated buyer", async () => {
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
    const record = getPurchaseByToken(purchase.token);
    expect(record).not.toBeNull();
    record!.expiresAt = "2000-01-01T00:00:00.000Z";

    const expiredResponse = await downloadRoute(
      new Request(`http://localhost/api/download/${purchase.token}`),
      { params: Promise.resolve({ token: purchase.token }) }
    );
    expect(expiredResponse.status).toBe(404);

    const refreshedResponse = await downloadRoute(
      new Request(`http://localhost/api/download/${purchase.token}`, {
        headers: {
          cookie: `agentvault_buyer_email=${encodeURIComponent(buyerEmail)}`
        }
      }),
      { params: Promise.resolve({ token: purchase.token }) }
    );
    expect(refreshedResponse.status).toBe(200);

    const refreshed = (await refreshedResponse.json()) as DownloadResponse;
    expect(refreshed.refreshedLink).toBe(true);
    expect(refreshed.token).not.toBe(purchase.token);
    expect(refreshed.downloadPath).toBe(`/api/download/${refreshed.token}`);
    expect(refreshed.downloadCount).toBe(1);

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
    expect(history.purchases[0]?.token).toBe(refreshed.token);
  });
});
