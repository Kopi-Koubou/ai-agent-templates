import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildPurchaseLicensePreview,
  buildPurchaseReceiptPreview,
  createPurchase,
  PURCHASE_TTL_MS
} from "@/lib/purchase-store";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";

const purchaseSchema = z.object({
  templateSlug: z.string().min(1),
  email: z.string().email()
});

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = purchaseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid purchase payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const purchase = createPurchase(parsed.data.templateSlug, parsed.data.email);

    const response = NextResponse.json({
      orderId: purchase.orderId,
      token: purchase.token,
      expiresAt: purchase.expiresAt,
      downloadPath: `/api/download/${purchase.token}`,
      dashboardPath: "/dashboard",
      license: buildPurchaseLicensePreview(purchase),
      receipt: buildPurchaseReceiptPreview(purchase)
    });

    response.cookies.set(BUYER_EMAIL_COOKIE, purchase.email, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.round(PURCHASE_TTL_MS / 1000)
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create purchase"
      },
      { status: 404 }
    );
  }
}
