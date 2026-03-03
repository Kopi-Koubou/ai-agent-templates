import { beforeEach, describe, expect, test } from "vitest";

import { POST as purchaseRoute } from "@/app/api/purchase/route";
import { PATCH as reviewResponseRoute } from "@/app/api/templates/[slug]/reviews/[reviewId]/response/route";
import {
  GET as reviewsRoute,
  POST as createReviewRoute
} from "@/app/api/templates/[slug]/reviews/route";
import { clearPurchaseStoreForTests } from "@/lib/purchase-store";
import { clearReviewStoreForTests } from "@/lib/review-store";

interface ReviewPayload {
  review: { id: string; sellerResponse?: string };
}

describe("reviews API flow", () => {
  beforeEach(() => {
    clearPurchaseStoreForTests();
    clearReviewStoreForTests();
  });

  test("creates verified review and allows seller response", async () => {
    const buyerEmail = "builder@example.com";
    await purchaseRoute(
      new Request("http://localhost/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSlug: "supportbot-pro",
          email: buyerEmail
        })
      })
    );

    const createResponse = await createReviewRoute(
      new Request("http://localhost/api/templates/supportbot-pro/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `agentvault_buyer_email=${encodeURIComponent(buyerEmail)}`
        },
        body: JSON.stringify({
          rating: 5,
          comment:
            "Excellent production starter with clear guidance for escalation and policy prompts."
        })
      }),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );

    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as ReviewPayload;
    expect(created.review.id).toMatch(/^rev_/);

    const listResponse = await reviewsRoute(
      new Request("http://localhost/api/templates/supportbot-pro/reviews?sort=popular"),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );
    expect(listResponse.status).toBe(200);

    const respondResponse = await reviewResponseRoute(
      new Request(
        `http://localhost/api/templates/supportbot-pro/reviews/${created.review.id}/response`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sellerResponse: "Thanks for shipping with AgentVault." })
        }
      ),
      {
        params: Promise.resolve({
          slug: "supportbot-pro",
          reviewId: created.review.id
        })
      }
    );

    expect(respondResponse.status).toBe(200);
    const responded = (await respondResponse.json()) as ReviewPayload;
    expect(responded.review.sellerResponse).toContain("Thanks");
  });

  test("rejects review submission without auth cookie", async () => {
    const response = await createReviewRoute(
      new Request("http://localhost/api/templates/supportbot-pro/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: 4,
          comment: "Solid baseline with good defaults."
        })
      }),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );

    expect(response.status).toBe(401);
  });
});
