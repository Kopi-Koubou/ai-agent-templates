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

    const purchase = createPurchase("supportbot-pro", "builder@example.com");
    expect(canReviewTemplate("builder@example.com", "supportbot-pro")).toBe(true);

    purchase.expiresAt = "2000-01-01T00:00:00.000Z";
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

  test("supports newest, rating, and popular sort modes", () => {
    const byNewest = listReviews("supportbot-pro", "newest");
    const byRating = listReviews("supportbot-pro", "rating");
    const byPopular = listReviews("supportbot-pro", "popular");

    expect(Date.parse(byNewest[0].createdAt)).toBeGreaterThanOrEqual(
      Date.parse(byNewest[byNewest.length - 1].createdAt)
    );
    expect(byRating[0].rating).toBeGreaterThanOrEqual(
      byRating[byRating.length - 1].rating
    );
    expect(byPopular[0].helpfulVotes).toBeGreaterThanOrEqual(
      byPopular[byPopular.length - 1].helpfulVotes
    );
  });
});
