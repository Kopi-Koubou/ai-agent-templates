import { NextResponse } from "next/server";

import { getTemplateBySlug } from "@/lib/catalog";
import {
  buildTemplateCustomizationPackage,
  templateCustomizationInputSchema
} from "@/lib/customization";

interface Context {
  params: Promise<{ slug: string }>;
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

  const body = await request.json().catch(() => null);
  const parsed = templateCustomizationInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid customization payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const customization = buildTemplateCustomizationPackage(template, parsed.data);

  return NextResponse.json({
    templateSlug: template.slug,
    templateTitle: template.title,
    customization
  });
}
