import { describe, expect, test } from "vitest";

import {
  buildBundleCheckoutHref,
  buildTemplateCheckoutHref,
  resolveInitialBundleSlug,
  resolveInitialTemplateSlug
} from "@/lib/checkout";

const templates = [
  { slug: "supportbot-pro" },
  { slug: "contentpipeline" },
  { slug: "docgenerator" }
];

const bundles = [
  { slug: "agency-starter-kit" },
  { slug: "full-collection" }
];

describe("resolveInitialTemplateSlug", () => {
  test("falls back to the first template when no initial slug is provided", () => {
    expect(resolveInitialTemplateSlug(templates)).toBe("supportbot-pro");
  });

  test("returns the requested slug when it exists", () => {
    expect(resolveInitialTemplateSlug(templates, "contentpipeline")).toBe(
      "contentpipeline"
    );
  });

  test("falls back when the requested slug does not exist", () => {
    expect(resolveInitialTemplateSlug(templates, "missing-template")).toBe(
      "supportbot-pro"
    );
  });

  test("trims whitespace from a valid requested slug", () => {
    expect(resolveInitialTemplateSlug(templates, "  contentpipeline  ")).toBe(
      "contentpipeline"
    );
  });

  test("matches requested slugs case-insensitively", () => {
    expect(resolveInitialTemplateSlug(templates, "CONTENTPIPELINE")).toBe(
      "contentpipeline"
    );
  });

  test("returns an empty string when there are no templates", () => {
    expect(resolveInitialTemplateSlug([], "supportbot-pro")).toBe("");
  });
});

describe("resolveInitialBundleSlug", () => {
  test("falls back to the first bundle when no initial slug is provided", () => {
    expect(resolveInitialBundleSlug(bundles)).toBe("agency-starter-kit");
  });

  test("returns the requested slug when it exists", () => {
    expect(resolveInitialBundleSlug(bundles, "full-collection")).toBe(
      "full-collection"
    );
  });

  test("falls back when the requested slug does not exist", () => {
    expect(resolveInitialBundleSlug(bundles, "missing-bundle")).toBe(
      "agency-starter-kit"
    );
  });

  test("trims and matches requested bundle slugs case-insensitively", () => {
    expect(resolveInitialBundleSlug(bundles, "  FULL-COLLECTION ")).toBe(
      "full-collection"
    );
  });

  test("returns an empty string when there are no bundles", () => {
    expect(resolveInitialBundleSlug([], "agency-starter-kit")).toBe("");
  });
});

describe("checkout URL builders", () => {
  test("builds template checkout URL", () => {
    expect(buildTemplateCheckoutHref("supportbot-pro")).toBe(
      "/checkout?template=supportbot-pro"
    );
  });

  test("builds bundle checkout URL", () => {
    expect(buildBundleCheckoutHref("agency-starter-kit")).toBe(
      "/checkout?bundle=agency-starter-kit"
    );
  });

  test("returns base checkout URL when slug is empty", () => {
    expect(buildTemplateCheckoutHref("   ")).toBe("/checkout");
    expect(buildBundleCheckoutHref(undefined)).toBe("/checkout");
  });

  test("encodes URL values safely", () => {
    expect(buildTemplateCheckoutHref("custom slug")).toBe(
      "/checkout?template=custom+slug"
    );
  });
});
