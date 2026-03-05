export interface CheckoutTemplateLike {
  slug: string;
}

export function resolveInitialTemplateSlug(
  templates: CheckoutTemplateLike[],
  initialTemplateSlug?: string
): string {
  if (templates.length === 0) {
    return "";
  }

  if (!initialTemplateSlug) {
    return templates[0].slug;
  }

  const requestedSlug = initialTemplateSlug.trim();
  if (!requestedSlug) {
    return templates[0].slug;
  }

  return templates.some((template) => template.slug === requestedSlug)
    ? requestedSlug
    : templates[0].slug;
}
