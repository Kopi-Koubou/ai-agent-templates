import { beforeEach, describe, expect, test } from "vitest";

import { GET as templateRoute } from "@/app/api/templates/[slug]/route";
import { POST as purchaseRoute } from "@/app/api/purchase/route";
import { GET as templatesRoute } from "@/app/api/templates/route";
import { POST as createReviewRoute } from "@/app/api/templates/[slug]/reviews/route";
import { clearPurchaseStoreForTests } from "@/lib/purchase-store";
import { clearReviewStoreForTests } from "@/lib/review-store";

interface TemplateListing {
  slug: string;
}

interface TemplatesResponse {
  templates: TemplateListing[];
}

interface TemplateResponse {
  slug: string;
  rating: number;
  reviewCount: number;
}

describe("catalog rating summary flow", () => {
  beforeEach(() => {
    clearPurchaseStoreForTests();
    clearReviewStoreForTests();
  });

  test("uses live review summary values in catalog and template APIs", async () => {
    const buyerEmail = "builder@example.com";

    const beforeResponse = await templatesRoute(
      new Request("http://localhost/api/templates?minRating=4.8")
    );
    expect(beforeResponse.status).toBe(200);
    const beforePayload = (await beforeResponse.json()) as TemplatesResponse;
    expect(beforePayload.templates.some((template) => template.slug === "supportbot-pro")).toBe(
      true
    );

    const purchaseResponse = await purchaseRoute(
      new Request("http://localhost/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSlug: "supportbot-pro",
          email: buyerEmail
        })
      })
    );
    expect(purchaseResponse.status).toBe(200);

    const reviewResponse = await createReviewRoute(
      new Request("http://localhost/api/templates/supportbot-pro/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `agentvault_buyer_email=${encodeURIComponent(buyerEmail)}`
        },
        body: JSON.stringify({
          rating: 1,
          comment:
            "Solid base but we had to rework escalation and policy prompts to fit our operations."
        })
      }),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );
    expect(reviewResponse.status).toBe(201);

    const afterResponse = await templatesRoute(
      new Request("http://localhost/api/templates?minRating=4.8")
    );
    expect(afterResponse.status).toBe(200);
    const afterPayload = (await afterResponse.json()) as TemplatesResponse;
    expect(afterPayload.templates.some((template) => template.slug === "supportbot-pro")).toBe(
      false
    );

    const templateResponse = await templateRoute(
      new Request("http://localhost/api/templates/supportbot-pro"),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );
    expect(templateResponse.status).toBe(200);
    const templatePayload = (await templateResponse.json()) as TemplateResponse;

    expect(templatePayload.slug).toBe("supportbot-pro");
    expect(templatePayload.reviewCount).toBe(42);
    expect(templatePayload.rating).toBe(4.7);
  });
});
