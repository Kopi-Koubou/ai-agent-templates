import { NextResponse } from "next/server";

import { getTemplateBySlug } from "@/lib/catalog";
import { listFavoritesByEmail } from "@/lib/favorite-store";
import { getCookieValue } from "@/lib/http";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";

export async function GET(request: Request): Promise<Response> {
  const buyerEmail = getCookieValue(request, BUYER_EMAIL_COOKIE);

  if (!buyerEmail) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const favoriteSlugs = listFavoritesByEmail(buyerEmail);
  const favorites = favoriteSlugs
    .map((slug) => getTemplateBySlug(slug))
    .filter((template) => template !== undefined);

  return NextResponse.json({
    buyerEmail,
    count: favorites.length,
    favorites
  });
}
