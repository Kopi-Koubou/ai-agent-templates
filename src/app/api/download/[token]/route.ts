import { NextResponse } from "next/server";

import { getCookieValue } from "@/lib/http";
import {
  PurchaseRecord,
  recordDownload,
  refreshPurchaseDownloadToken
} from "@/lib/purchase-store";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";

interface Context {
  params: Promise<{ token: string }>;
}

function buildDownloadPayload(
  purchase: PurchaseRecord,
  refreshedLink: boolean
): Record<string, unknown> {
  return {
    template: purchase.templateTitle,
    token: purchase.token,
    purchasedAt: purchase.purchasedAt,
    expiresAt: purchase.expiresAt,
    downloadedAt: purchase.lastDownloadedAt,
    downloadCount: purchase.downloadCount,
    downloadHistory: purchase.downloadHistory,
    downloadPath: `/api/download/${purchase.token}`,
    refreshedLink,
    downloadUrl: `/downloads/${purchase.templateSlug}.zip`,
    downloadHint:
      "In production this endpoint returns a signed Supabase storage URL for a template ZIP package."
  };
}

export async function GET(
  request: Request,
  context: Context
): Promise<Response> {
  const { token } = await context.params;
  const purchase = recordDownload(token);

  if (purchase) {
    return NextResponse.json(buildDownloadPayload(purchase, false));
  }

  const buyerEmail = getCookieValue(request, BUYER_EMAIL_COOKIE);
  if (buyerEmail) {
    const refreshedPurchase = refreshPurchaseDownloadToken(token, buyerEmail);

    if (refreshedPurchase) {
      const renewedDownload = recordDownload(refreshedPurchase.token);

      if (renewedDownload) {
        return NextResponse.json(
          buildDownloadPayload(renewedDownload, refreshedPurchase.token !== token)
        );
      }
    }
  }

  return NextResponse.json(
    { error: "Download link is invalid or expired" },
    { status: 404 }
  );
}
