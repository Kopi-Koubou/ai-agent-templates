import { beforeEach, describe, expect, test } from "vitest";

import { GET as favoritesRoute } from "@/app/api/favorites/route";
import {
  DELETE as removeFavoriteRoute,
  POST as saveFavoriteRoute
} from "@/app/api/templates/[slug]/favorite/route";
import { clearFavoriteStoreForTests } from "@/lib/favorite-store";

interface FavoriteMutationResponse {
  templateSlug: string;
  saved: boolean;
  favoritesCount: number;
}

interface FavoritesResponse {
  count: number;
  favorites: Array<{ slug: string }>;
}

describe("favorites API flow", () => {
  beforeEach(() => {
    clearFavoriteStoreForTests();
  });

  test("saves, lists, and removes favorites for authenticated buyer", async () => {
    const buyerCookie = "agentvault_buyer_email=builder%40example.com";

    const saveResponse = await saveFavoriteRoute(
      new Request("http://localhost/api/templates/supportbot-pro/favorite", {
        method: "POST",
        headers: {
          cookie: buyerCookie
        }
      }),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );
    expect(saveResponse.status).toBe(200);

    const saved = (await saveResponse.json()) as FavoriteMutationResponse;
    expect(saved.templateSlug).toBe("supportbot-pro");
    expect(saved.saved).toBe(true);
    expect(saved.favoritesCount).toBe(1);

    const listResponse = await favoritesRoute(
      new Request("http://localhost/api/favorites", {
        headers: {
          cookie: buyerCookie
        }
      })
    );
    expect(listResponse.status).toBe(200);

    const listed = (await listResponse.json()) as FavoritesResponse;
    expect(listed.count).toBe(1);
    expect(listed.favorites[0]?.slug).toBe("supportbot-pro");

    const removeResponse = await removeFavoriteRoute(
      new Request("http://localhost/api/templates/supportbot-pro/favorite", {
        method: "DELETE",
        headers: {
          cookie: buyerCookie
        }
      }),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );
    expect(removeResponse.status).toBe(200);

    const removed = (await removeResponse.json()) as FavoriteMutationResponse;
    expect(removed.saved).toBe(false);
    expect(removed.favoritesCount).toBe(0);
  });

  test("rejects favorite calls when buyer is unauthenticated", async () => {
    const response = await saveFavoriteRoute(
      new Request("http://localhost/api/templates/supportbot-pro/favorite", {
        method: "POST"
      }),
      { params: Promise.resolve({ slug: "supportbot-pro" }) }
    );

    expect(response.status).toBe(401);
  });
});
