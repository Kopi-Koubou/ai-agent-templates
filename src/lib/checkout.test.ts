import { describe, expect, test } from "vitest";

import { resolveInitialTemplateSlug } from "@/lib/checkout";

const templates = [
  { slug: "supportbot-pro" },
  { slug: "contentpipeline" },
  { slug: "docgenerator" }
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

  test("returns an empty string when there are no templates", () => {
    expect(resolveInitialTemplateSlug([], "supportbot-pro")).toBe("");
  });
});
