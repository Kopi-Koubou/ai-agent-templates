import { NextResponse } from "next/server";

import { listPublishedBundleDetails } from "@/lib/bundles";

export async function GET(): Promise<Response> {
  const bundles = listPublishedBundleDetails();

  return NextResponse.json({
    count: bundles.length,
    bundles
  });
}
