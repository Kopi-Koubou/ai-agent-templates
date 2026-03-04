import { NextResponse } from "next/server";

import { listFavoritesByEmail } from "@/lib/favorite-store";
import { getCookieValue } from "@/lib/http";
import { buildBuyerProfile } from "@/lib/profile";
import { listPurchasesByEmail } from "@/lib/purchase-store";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";

export async function GET(request: Request): Promise<Response> {
  const buyerEmail = getCookieValue(request, BUYER_EMAIL_COOKIE);

  if (!buyerEmail) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const purchases = listPurchasesByEmail(buyerEmail);
  const favoriteSlugs = listFavoritesByEmail(buyerEmail);

  return NextResponse.json({
    profile: buildBuyerProfile(buyerEmail, purchases, favoriteSlugs)
  });
}
