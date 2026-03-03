import { NextResponse } from "next/server";
import { z } from "zod";

import { createPurchase } from "@/lib/purchase-store";

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

    return NextResponse.json({
      orderId: purchase.orderId,
      token: purchase.token,
      expiresAt: purchase.expiresAt,
      downloadPath: `/api/download/${purchase.token}`
    });
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
