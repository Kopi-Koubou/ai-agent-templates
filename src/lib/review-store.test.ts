import { beforeEach, describe, expect, test } from "vitest";

import { templates } from "@/data/templates";
import { clearPurchaseStoreForTests, createPurchase } from "@/lib/purchase-store";
import {
  canReviewTemplate,
  clearReviewStoreForTests,
  createReview,
  getTemplateReviewSummary,
  listReviews,
  setSellerResponse
} from "@/lib/review-store";

describe("review store", () => {
  beforeEach(() => {
    clearPurchaseStoreForTests();
    clearReviewStoreForTests();
  });

  test("lists seeded reviews", () => {
    const reviews = listReviews("supportbot-pro");
    expect(reviews.length).toBeGreaterThan(0);
  });

  test("requires purchase verification before review", () => {
    expect(canReviewTemplate("builder@example.com", "supportbot-pro")).toBe(false);

    createPurchase("supportbot-pro", "builder@example.com");
    expect(canReviewTemplate("builder@example.com", "supportbot-pro")).toBe(true);
  });

  test("creates reviews and updates summary", () => {
    const template = templates.find((entry) => entry.slug === "supportbot-pro");
    expect(template).toBeDefined();

    const before = getTemplateReviewSummary(template!);
    createReview(
      "supportbot-pro",
      "builder@example.com",
      4,
      "Strong baseline flow and clear policies, but we still tuned two escalation prompts."
    );
    const after = getTemplateReviewSummary(template!);

    expect(after.reviewCount).toBe(before.reviewCount + 1);
    expect(after.averageRating).toBeLessThanOrEqual(before.averageRating);
  });

  test("supports seller responses", () => {
    const review = createReview(
      "supportbot-pro",
      "builder@example.com",
      5,
      "Great implementation and easy setup."
    );

    const responded = setSellerResponse(
      "supportbot-pro",
      review.id,
      "Thanks for the feedback."
    );

    expect(responded?.sellerResponse).toContain("Thanks");
  });
});
