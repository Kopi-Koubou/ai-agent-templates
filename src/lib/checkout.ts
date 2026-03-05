interface CheckoutSlugLike {
  slug: string;
}

function resolveInitialSlug(
  items: CheckoutSlugLike[],
  initialSlug?: string
): string {
  if (items.length === 0) {
    return "";
  }

  if (!initialSlug) {
    return items[0].slug;
  }

  const requestedSlug = initialSlug.trim();
  if (!requestedSlug) {
    return items[0].slug;
  }

  return items.some((item) => item.slug === requestedSlug)
    ? requestedSlug
    : items[0].slug;
}

export interface CheckoutTemplateLike {
  slug: string;
}

export interface CheckoutBundleLike {
  slug: string;
}

export function resolveInitialTemplateSlug(
  templates: CheckoutTemplateLike[],
  initialTemplateSlug?: string
): string {
  return resolveInitialSlug(templates, initialTemplateSlug);
}

export function resolveInitialBundleSlug(
  bundles: CheckoutBundleLike[],
  initialBundleSlug?: string
): string {
  return resolveInitialSlug(bundles, initialBundleSlug);
}
