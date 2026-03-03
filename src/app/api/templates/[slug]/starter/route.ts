import { NextResponse } from "next/server";

import { getTemplateBySlug } from "@/lib/catalog";
import { isStarterTemplateAvailable } from "@/lib/template-preview";

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

  if (!isStarterTemplateAvailable(template.slug)) {
    return NextResponse.json(
      { error: "Free starter is not available for this template" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    template: template.title,
    templateSlug: template.slug,
    starterPackagePath: `/downloads/${template.slug}-starter.zip`,
    limitations: [
      "Includes starter prompt set and baseline tool config",
      "Omits premium test suite and deployment package",
      "For evaluation and local setup only"
    ]
  });
}
