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

  test("parses URL query into catalog query", () => {
    const searchParams = new URLSearchParams(
      "q=data&category=data&framework=crewai&complexity=advanced&minPrice=79&sort=price-desc"
    );

    const query = parseCatalogQueryFromSearchParams(searchParams);

    expect(query.q).toBe("data");
    expect(query.categories).toEqual(["data"]);
    expect(query.frameworks).toEqual(["crewai"]);
    expect(query.complexity).toEqual(["advanced"]);
    expect(query.minPrice).toBe(7900);
    expect(query.sort).toBe("price-desc");
  });
});
