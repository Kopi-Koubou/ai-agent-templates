import { describe, expect, test } from "vitest";

import {
  buildBundleDetail,
  getBundleBySlug,
  listPublishedBundleDetails,
  listPublishedBundlesForTemplate
} from "@/lib/bundles";

describe("bundles", () => {
  test("lists published bundle details with pricing metadata", () => {
    const bundles = listPublishedBundleDetails();

    expect(bundles.length).toBeGreaterThan(0);
    expect(bundles.some((bundle) => bundle.slug === "agency-starter-kit")).toBe(
      true
    );
    expect(
      bundles.every((bundle) => bundle.pricing.retailCents >= bundle.priceCents)
    ).toBe(true);
  });

  test("builds bundle detail for known bundle slug", () => {
    const bundle = getBundleBySlug("agency-starter-kit");
    expect(bundle).toBeDefined();

    const detail = buildBundleDetail(bundle!);
    expect(detail.templates).toHaveLength(4);
    expect(detail.pricing.bundlePriceCents).toBe(27900);
    expect(detail.pricing.retailCents).toBe(35600);
    expect(detail.pricing.savingsCents).toBe(7700);
    expect(detail.pricing.effectiveDiscountPct).toBe(22);
  });

  test("lists bundles that include a given template", () => {
    const bundles = listPublishedBundlesForTemplate("supportbot-pro");
    expect(bundles.length).toBeGreaterThan(0);
    expect(
      bundles.some((bundle) => bundle.slug === "agency-starter-kit")
    ).toBe(true);
  });
});
