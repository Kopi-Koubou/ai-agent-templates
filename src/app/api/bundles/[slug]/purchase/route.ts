import { NextResponse } from "next/server";
import { z } from "zod";

import { createBundlePurchase } from "@/lib/bundle-store";
import { PAYMENT_METHODS } from "@/lib/payment-methods";
import { PURCHASE_TTL_MS } from "@/lib/purchase-store";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";

const purchaseSchema = z.object({
  email: z.string().email(),
  paymentMethod: z.enum(PAYMENT_METHODS).default("card")
});

interface Context {
  params: Promise<{ slug: string }>;
}

export async function POST(
  request: Request,
  context: Context
): Promise<Response> {
  const { slug } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = purchaseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid bundle purchase payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const purchase = createBundlePurchase(
      slug,
      parsed.data.email,
      parsed.data.paymentMethod
    );

    const response = NextResponse.json(purchase);
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
            : "Could not create bundle purchase"
      },
      { status: 404 }
    );
  }
}
