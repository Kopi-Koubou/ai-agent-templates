import { NextResponse } from "next/server";
import { z } from "zod";

import { getTemplateBySlug } from "@/lib/catalog";
import { setSellerResponse } from "@/lib/review-store";

const responseSchema = z.object({
  sellerResponse: z.string().trim().min(4).max(600)
});

interface Context {
  params: Promise<{ slug: string; reviewId: string }>;
}

export async function PATCH(
  request: Request,
  context: Context
): Promise<Response> {
  const { slug, reviewId } = await context.params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = responseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid seller response payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const review = setSellerResponse(slug, reviewId, parsed.data.sellerResponse);
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  return NextResponse.json({ review });
}
