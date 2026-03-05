import { NextResponse } from "next/server";

import { templates } from "@/data/templates";
import {
  filterTemplates,
  parseCatalogQueryFromSearchParams
} from "@/lib/catalog";
import { withLiveReviewSummaries } from "@/lib/template-catalog-view";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = parseCatalogQueryFromSearchParams(url.searchParams);
  const results = filterTemplates(withLiveReviewSummaries(templates), query);

  return NextResponse.json({
    count: results.length,
    query,
    templates: results
  });
}
