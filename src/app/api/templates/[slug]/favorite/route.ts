import { NextResponse } from "next/server";

import { getTemplateBySlug } from "@/lib/catalog";
import {
  addFavoriteTemplate,
  removeFavoriteTemplate
} from "@/lib/favorite-store";
import { getCookieValue } from "@/lib/http";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";

interface Context {
  params: Promise<{ slug: string }>;
}

function resolveBuyerEmail(request: Request): string | null {
  return getCookieValue(request, BUYER_EMAIL_COOKIE);
}

export async function POST(
  request: Request,
  context: Context
): Promise<Response> {
  const buyerEmail = resolveBuyerEmail(request);
  if (!buyerEmail) {
    return NextResponse.json(
      { error: "Authentication required to save favorites" },
      { status: 401 }
    );
  }

  const { slug } = await context.params;
  const template = getTemplateBySlug(slug);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const favorites = addFavoriteTemplate(buyerEmail, slug);

  return NextResponse.json({
    templateSlug: slug,
    saved: true,
    favoritesCount: favorites.length
  });
}

export async function DELETE(
  request: Request,
  context: Context
): Promise<Response> {
  const buyerEmail = resolveBuyerEmail(request);
  if (!buyerEmail) {
    return NextResponse.json(
      { error: "Authentication required to save favorites" },
      { status: 401 }
    );
  }

  const { slug } = await context.params;
  const template = getTemplateBySlug(slug);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const favorites = removeFavoriteTemplate(buyerEmail, slug);

  return NextResponse.json({
    templateSlug: slug,
    saved: false,
    favoritesCount: favorites.length
  });
}
