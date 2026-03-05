import { NextResponse } from "next/server";

import { getCookieValue } from "@/lib/http";
import { listTemplateUpdateNotifications } from "@/lib/update-notifications";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";

export async function GET(request: Request): Promise<Response> {
  const buyerEmail = getCookieValue(request, BUYER_EMAIL_COOKIE);

  if (!buyerEmail) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const notifications = listTemplateUpdateNotifications(buyerEmail);

  return NextResponse.json({
    buyerEmail,
    count: notifications.length,
    notifications
  });
}
