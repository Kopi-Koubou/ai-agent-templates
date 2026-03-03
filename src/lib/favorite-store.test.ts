import { beforeEach, describe, expect, test } from "vitest";

import {
  addFavoriteTemplate,
  clearFavoriteStoreForTests,
  isTemplateFavoritedByEmail,
  listFavoritesByEmail,
  removeFavoriteTemplate
} from "@/lib/favorite-store";

describe("favorite store", () => {
  beforeEach(() => {
    clearFavoriteStoreForTests();
  });

  test("adds and lists favorites by normalized email", () => {
    const list = addFavoriteTemplate("Builder@Example.com ", "supportbot-pro");

    expect(list).toEqual(["supportbot-pro"]);
    expect(listFavoritesByEmail("builder@example.com")).toEqual([
      "supportbot-pro"
    ]);
  });

  test("checks favorited status per email", () => {
    addFavoriteTemplate("builder@example.com", "supportbot-pro");

    expect(
      isTemplateFavoritedByEmail("builder@example.com", "supportbot-pro")
    ).toBe(true);
    expect(
      isTemplateFavoritedByEmail("other@example.com", "supportbot-pro")
    ).toBe(false);
  });

  test("removes favorites and cleans empty records", () => {
    addFavoriteTemplate("builder@example.com", "supportbot-pro");
    addFavoriteTemplate("builder@example.com", "contentpipeline");

    const remaining = removeFavoriteTemplate(
      "builder@example.com",
      "supportbot-pro"
    );
    expect(remaining).toEqual(["contentpipeline"]);

    const cleared = removeFavoriteTemplate(
      "builder@example.com",
      "contentpipeline"
    );
    expect(cleared).toEqual([]);
    expect(listFavoritesByEmail("builder@example.com")).toEqual([]);
  });
});
