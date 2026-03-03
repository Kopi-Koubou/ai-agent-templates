import { NextResponse } from "next/server";

import { recordDownload } from "@/lib/purchase-store";

interface Context {
  params: Promise<{ token: string }>;
}

export async function GET(
  _request: Request,
  context: Context
): Promise<Response> {
  const { token } = await context.params;
  const purchase = recordDownload(token);

  if (!purchase) {
    return NextResponse.json(
      { error: "Download link is invalid or expired" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    template: purchase.templateTitle,
    purchasedAt: purchase.purchasedAt,
    expiresAt: purchase.expiresAt,
    downloadCount: purchase.downloadCount,
    downloadUrl: `/downloads/${purchase.templateSlug}.zip`,
    downloadHint:
      "In production this endpoint returns a signed Supabase storage URL for a template ZIP package."
  });
}
