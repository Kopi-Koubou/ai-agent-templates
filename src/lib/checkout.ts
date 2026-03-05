interface CheckoutSlugLike {
  slug: string;
}

function normalizeSlug(slug: string | undefined): string {
  if (!slug) {
    return "";
  }

  return slug.trim().toLowerCase();
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

  const requestedSlug = normalizeSlug(initialSlug);
  if (!requestedSlug) {
    return items[0].slug;
  }

  const matchedItem = items.find(
    (item) => normalizeSlug(item.slug) === requestedSlug
  );

  return matchedItem ? matchedItem.slug : items[0].slug;
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

function buildCheckoutHref(
  key: "template" | "bundle",
  slug: string | undefined
): string {
  const normalizedSlug = slug?.trim();
  if (!normalizedSlug) {
    return "/checkout";
  }

  const searchParams = new URLSearchParams([[key, normalizedSlug]]);
  return `/checkout?${searchParams.toString()}`;
}

export function buildTemplateCheckoutHref(templateSlug: string | undefined): string {
  return buildCheckoutHref("template", templateSlug);
}

export function buildBundleCheckoutHref(bundleSlug: string | undefined): string {
  return buildCheckoutHref("bundle", bundleSlug);
}
