import { NextResponse } from "next/server";

import { getTemplateBySlug } from "@/lib/catalog";
import { withLiveReviewSummary } from "@/lib/template-catalog-view";

interface Context {
  params: Promise<{ slug: string }>;
}

export async function GET(
  _request: Request,
  context: Context
): Promise<Response> {
  const { slug } = await context.params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json(withLiveReviewSummary(template));
}
