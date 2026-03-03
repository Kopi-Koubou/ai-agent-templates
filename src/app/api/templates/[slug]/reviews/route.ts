import { NextResponse } from "next/server";
import { z } from "zod";

import { getTemplateBySlug } from "@/lib/catalog";
import { getCookieValue } from "@/lib/http";
import {
  canReviewTemplate,
  createReview,
  getTemplateReviewSummary,
  listReviews,
  ReviewSortMode
} from "@/lib/review-store";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";
const REVIEW_SORT_MODES: ReviewSortMode[] = ["newest", "rating", "popular"];

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(12).max(600)
});

interface Context {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: Request,
  context: Context
): Promise<Response> {
  const { slug } = await context.params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const requestedSort = url.searchParams.get("sort");
  const sort: ReviewSortMode =
    requestedSort && REVIEW_SORT_MODES.includes(requestedSort as ReviewSortMode)
      ? (requestedSort as ReviewSortMode)
      : "newest";

  return NextResponse.json({
    templateSlug: slug,
    sort,
    summary: getTemplateReviewSummary(template),
    reviews: listReviews(slug, sort)
  });
}

export async function POST(
  request: Request,
  context: Context
): Promise<Response> {
  const { slug } = await context.params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const buyerEmail = getCookieValue(request, BUYER_EMAIL_COOKIE);
  if (!buyerEmail) {
    return NextResponse.json(
      { error: "Authentication required to leave a review" },
      { status: 401 }
    );
  }

  if (!canReviewTemplate(buyerEmail, slug)) {
    return NextResponse.json(
      { error: "A verified purchase is required before leaving a review" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const review = createReview(
    slug,
    buyerEmail,
    parsed.data.rating,
    parsed.data.comment
  );

  return NextResponse.json({ review }, { status: 201 });
}
