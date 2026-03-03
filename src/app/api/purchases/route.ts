import { NextResponse } from "next/server";

import { listPurchasesByEmail } from "@/lib/purchase-store";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";

function getCookieValue(request: Request, cookieName: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((entry) => entry.trim());
  const target = cookies.find((entry) => entry.startsWith(`${cookieName}=`));

  if (!target) {
    return null;
  }

  const raw = target.slice(cookieName.length + 1);

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

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
