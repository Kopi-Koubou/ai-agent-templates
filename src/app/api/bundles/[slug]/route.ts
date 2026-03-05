import { NextResponse } from "next/server";

import { buildBundleDetail, getBundleBySlug } from "@/lib/bundles";

interface Context {
  params: Promise<{ slug: string }>;
}

export async function GET(
  _request: Request,
  context: Context
): Promise<Response> {
  const { slug } = await context.params;
  const bundle = getBundleBySlug(slug);

  if (!bundle || !bundle.isPublished) {
    return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
  }

  return NextResponse.json(buildBundleDetail(bundle));
}
