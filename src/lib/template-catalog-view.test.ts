import { beforeEach, describe, expect, test } from "vitest";

import { templates } from "@/data/templates";
import { clearReviewStoreForTests, createReview } from "@/lib/review-store";
import { withLiveReviewSummary } from "@/lib/template-catalog-view";

describe("template catalog view", () => {
  beforeEach(() => {
    clearReviewStoreForTests();
  });

  test("returns original template when review summary is unchanged", () => {
    const template = templates.find((entry) => entry.slug === "supportbot-pro");
    expect(template).toBeDefined();

    const hydrated = withLiveReviewSummary(template!);
    expect(hydrated).toBe(template);
  });

  test("hydrates template with live review summary values", () => {
    const template = templates.find((entry) => entry.slug === "supportbot-pro");
    expect(template).toBeDefined();

    createReview(
      "supportbot-pro",
      "builder@example.com",
      1,
      "We needed to retune a lot of escalation logic for our stack."
    );

    const hydrated = withLiveReviewSummary(template!);

    expect(hydrated).not.toBe(template);
    expect(hydrated.reviewCount).toBe(template!.reviewCount + 1);
    expect(hydrated.rating).toBe(4.7);
  });
});
