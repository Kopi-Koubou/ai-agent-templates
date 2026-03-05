import { describe, expect, test } from "vitest";

import {
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

  test("returns an empty string when there are no bundles", () => {
    expect(resolveInitialBundleSlug([], "agency-starter-kit")).toBe("");
  });
});
