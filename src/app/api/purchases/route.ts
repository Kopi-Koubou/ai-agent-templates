import { NextResponse } from "next/server";

import { getCookieValue } from "@/lib/http";
import { listPurchasesByEmail } from "@/lib/purchase-store";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";

export async function GET(request: Request): Promise<Response> {
  const buyerEmail = getCookieValue(request, BUYER_EMAIL_COOKIE);

  if (!buyerEmail) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const purchases = listPurchasesByEmail(buyerEmail);
  return NextResponse.json({
    buyerEmail,
    count: purchases.length,
    purchases
  });
}
