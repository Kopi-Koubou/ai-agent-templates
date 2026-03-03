import { NextResponse } from "next/server";

import { parseCatalogQueryFromSearchParams, listCatalogTemplates } from "@/lib/catalog";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = parseCatalogQueryFromSearchParams(url.searchParams);
  const results = listCatalogTemplates(query);

  return NextResponse.json({
    count: results.length,
    query,
    templates: results
  });
}
