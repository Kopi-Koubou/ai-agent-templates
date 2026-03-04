import { beforeEach, describe, expect, test } from "vitest";

import { GET as profileRoute } from "@/app/api/profile/route";
import { addFavoriteTemplate, clearFavoriteStoreForTests } from "@/lib/favorite-store";
import { clearPurchaseStoreForTests, createPurchase } from "@/lib/purchase-store";

interface ProfileResponse {
  profile: {
    email: string;
    displayName: string;
    joinedAt?: string;
    purchasesCount: number;
    favoritesCount: number;
  };
}

describe("profile API flow", () => {
  beforeEach(() => {
    clearPurchaseStoreForTests();
    clearFavoriteStoreForTests();
  });

  test("returns normalized buyer profile details", async () => {
    createPurchase("supportbot-pro", "Builder.Ops@example.com");
    addFavoriteTemplate("Builder.Ops@example.com", "supportbot-pro");

    const response = await profileRoute(
      new Request("http://localhost/api/profile", {
        headers: {
          cookie: "agentvault_buyer_email=Builder.Ops%40example.com"
        }
      })
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as ProfileResponse;

    expect(payload.profile.email).toBe("builder.ops@example.com");
    expect(payload.profile.displayName).toBe("Builder Ops");
    expect(payload.profile.joinedAt).toBeDefined();
    expect(payload.profile.purchasesCount).toBe(1);
    expect(payload.profile.favoritesCount).toBe(1);
  });

  test("rejects profile requests without auth cookie", async () => {
    const response = await profileRoute(
      new Request("http://localhost/api/profile")
    );

    expect(response.status).toBe(401);
  });
});
