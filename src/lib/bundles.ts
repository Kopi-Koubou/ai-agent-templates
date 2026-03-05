import { bundles } from "@/data/bundles";
import { templates } from "@/data/templates";
import { Template } from "@/lib/types";

export interface Bundle {
  id: string;
  slug: string;
  title: string;
  description: string;
  templateSlugs: string[];
  priceCents: number;
  discountPct: number;
  isPublished: boolean;
}

export interface BundlePricingSummary {
  retailCents: number;
  bundlePriceCents: number;
  savingsCents: number;
  effectiveDiscountPct: number;
}

export interface BundleDetail extends Bundle {
  templates: Template[];
  pricing: BundlePricingSummary;
}

const templateBySlug = new Map(
  templates.map((template) => [template.slug, template])
);

function resolveTemplateBySlug(slug: string): Template {
  const template = templateBySlug.get(slug);
  if (!template) {
    throw new Error(`Template not found for bundle: ${slug}`);
  }

  return template;
}

export function listPublishedBundles(): Bundle[] {
  return bundles.filter((bundle) => bundle.isPublished);
}

export function getBundleBySlug(slug: string): Bundle | undefined {
  return bundles.find((bundle) => bundle.slug === slug);
}

export function resolveBundleTemplates(bundle: Bundle): Template[] {
  return bundle.templateSlugs.map(resolveTemplateBySlug);
}

export function buildBundlePricingSummary(
  bundle: Bundle,
  bundleTemplates: Template[] = resolveBundleTemplates(bundle)
): BundlePricingSummary {
  const retailCents = bundleTemplates.reduce(
    (sum, template) => sum + template.priceCents,
    0
  );
  const savingsCents = Math.max(0, retailCents - bundle.priceCents);
  const effectiveDiscountPct =
    retailCents === 0 ? 0 : Math.round((savingsCents / retailCents) * 100);

  return {
    retailCents,
    bundlePriceCents: bundle.priceCents,
    savingsCents,
    effectiveDiscountPct
  };
}

export function buildBundleDetail(bundle: Bundle): BundleDetail {
  const bundleTemplates = resolveBundleTemplates(bundle);

  return {
    ...bundle,
    templates: bundleTemplates,
    pricing: buildBundlePricingSummary(bundle, bundleTemplates)
  };
}

export function listPublishedBundleDetails(): BundleDetail[] {
  return listPublishedBundles().map(buildBundleDetail);
}

export function listPublishedBundlesForTemplate(
  templateSlug: string
): BundleDetail[] {
  return listPublishedBundleDetails().filter((bundle) =>
    bundle.templateSlugs.includes(templateSlug)
  );
}
