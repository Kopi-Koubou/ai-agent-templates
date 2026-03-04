import { describe, expect, test } from "vitest";

import { templates } from "@/data/templates";
import {
  filterTemplates,
  parseCatalogQueryFromSearchParams
} from "@/lib/catalog";

describe("catalog filtering", () => {
  test("filters by search text and category", () => {
    const results = filterTemplates(templates, {
      q: "support",
      categories: ["support"]
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((template) => template.category === "support")).toBe(true);
  });

  test("filters by framework list", () => {
    const results = filterTemplates(templates, {
      frameworks: ["crewai"]
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((template) => template.frameworks.includes("crewai"))).toBe(true);
  });

  test("sorts by price ascending", () => {
    const results = filterTemplates(templates, {
      sort: "price-asc"
    });

    expect(results[0].priceCents).toBeLessThanOrEqual(
      results[results.length - 1].priceCents
    );
  });

  test("sorts by newest first", () => {
    const results = filterTemplates(templates, {
      sort: "newest"
    });

    expect(Date.parse(results[0].publishedAt)).toBeGreaterThanOrEqual(
      Date.parse(results[results.length - 1].publishedAt)
    );
  });

  test("sorts by popularity", () => {
    const results = filterTemplates(templates, {
      sort: "popular"
    });

    expect(results[0].reviewCount).toBeGreaterThanOrEqual(
      results[results.length - 1].reviewCount
    );
  });

  test("filters by price range", () => {
    const results = filterTemplates(templates, {
      minPrice: 7900,
      maxPrice: 9900
    });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (template) =>
          template.priceCents >= 7900 && template.priceCents <= 9900
      )
    ).toBe(true);
  });

  test("filters by minimum rating", () => {
    const results = filterTemplates(templates, {
      minRating: 4.8
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((template) => template.rating >= 4.8)).toBe(true);
  });

  test("parses URL query into catalog query", () => {
    const searchParams = new URLSearchParams(
      "q=data&category=data&framework=crewai&complexity=advanced&minPrice=79&maxPrice=129&minRating=4.5&sort=price-desc"
    );

    const query = parseCatalogQueryFromSearchParams(searchParams);

    expect(query.q).toBe("data");
    expect(query.categories).toEqual(["data"]);
    expect(query.frameworks).toEqual(["crewai"]);
    expect(query.complexity).toEqual(["advanced"]);
    expect(query.minPrice).toBe(7900);
    expect(query.maxPrice).toBe(12900);
    expect(query.minRating).toBe(4.5);
    expect(query.sort).toBe("price-desc");
  });

  test("parses popular sort mode", () => {
    const searchParams = new URLSearchParams("sort=popular");
    const query = parseCatalogQueryFromSearchParams(searchParams);

    expect(query.sort).toBe("popular");
  });
});
