import { templates } from "@/data/templates";
import {
  CatalogQuery,
  Complexity,
  SortMode,
  Template,
  TemplateCategory,
  TemplateFramework
} from "@/lib/types";

const DEFAULT_SORT: SortMode = "featured";

const CATEGORY_VALUES = new Set<TemplateCategory>([
  "support",
  "content",
  "data",
  "devtools"
]);

const FRAMEWORK_VALUES = new Set<TemplateFramework>([
  "openclaw",
  "claude-code",
  "langgraph",
  "crewai"
]);

const COMPLEXITY_VALUES = new Set<Complexity>([
  "beginner",
  "intermediate",
  "advanced"
]);

const QUERY_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "agent",
  "any",
  "as",
  "for",
  "from",
  "handles",
  "handling",
  "help",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "need",
  "of",
  "please",
  "request",
  "requests",
  "the",
  "that",
  "to",
  "want",
  "with"
]);

function parseEnumListFromSearchParams<T extends string>(
  searchParams: URLSearchParams,
  key: string,
  allowedValues: Set<T>
): T[] | undefined {
  const rawValues = searchParams
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (rawValues.length === 0) {
    return undefined;
  }

  const filtered = rawValues.filter((item): item is T =>
    allowedValues.has(item as T)
  );

  return filtered.length > 0 ? Array.from(new Set(filtered)) : undefined;
}

function parsePrice(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return Math.round(parsed * 100);
}

function parseRating(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 5) {
    return undefined;
  }

  return Number(parsed.toFixed(1));
}

function includesAny<T extends string>(
  selected: T[] | undefined,
  values: T[]
): boolean {
  if (!selected || selected.length === 0) {
    return true;
  }

  const valueSet = new Set(values);
  return selected.some((entry) => valueSet.has(entry));
}

function tokenizeSearchQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !QUERY_STOP_WORDS.has(token));
}

function matchesQuery(template: Template, query: string | undefined): boolean {
  if (!query) {
    return true;
  }

  const normalized = query.toLowerCase();
  const fullText = [
    template.title,
    template.summary,
    template.longDescription,
    template.category,
    template.complexity,
    ...template.frameworks,
    ...template.tags,
    ...template.includes
  ]
    .join(" ")
    .toLowerCase();

  if (fullText.includes(normalized)) {
    return true;
  }

  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) {
    return true;
  }

  return tokens.every((token) => fullText.includes(token));
}

function sortTemplates(list: Template[], sort: SortMode): Template[] {
  const sorted = [...list];

  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
      );
    case "popular":
      return sorted.sort((a, b) => {
        if (a.reviewCount !== b.reviewCount) {
          return b.reviewCount - a.reviewCount;
        }

        return b.rating - a.rating;
      });
    case "price-asc":
      return sorted.sort((a, b) => a.priceCents - b.priceCents);
    case "price-desc":
      return sorted.sort((a, b) => b.priceCents - a.priceCents);
    case "rating-desc":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "featured":
    default:
      return sorted.sort((a, b) => {
        if (a.featured !== b.featured) {
          return Number(b.featured) - Number(a.featured);
        }

        if (a.rating !== b.rating) {
          return b.rating - a.rating;
        }

        return a.priceCents - b.priceCents;
      });
  }
}

export function parseCatalogQueryFromSearchParams(
  searchParams: URLSearchParams
): CatalogQuery {
  const queryText = searchParams.get("q")?.trim() ?? undefined;
  const categories = parseEnumListFromSearchParams(
    searchParams,
    "category",
    CATEGORY_VALUES
  );
  const frameworks = parseEnumListFromSearchParams(
    searchParams,
    "framework",
    FRAMEWORK_VALUES
  );
  const complexity = parseEnumListFromSearchParams(
    searchParams,
    "complexity",
    COMPLEXITY_VALUES
  );
  const minPrice = parsePrice(searchParams.get("minPrice"));
  const maxPrice = parsePrice(searchParams.get("maxPrice"));
  const minRating = parseRating(searchParams.get("minRating"));
  const requestedSort = searchParams.get("sort") as SortMode | null;

  const sort =
    requestedSort &&
    [
      "featured",
      "price-asc",
      "price-desc",
      "rating-desc",
      "newest",
      "popular"
    ].includes(
      requestedSort
    )
      ? requestedSort
      : DEFAULT_SORT;

  const resolvedMinPrice =
    typeof minPrice === "number" && typeof maxPrice === "number"
      ? Math.min(minPrice, maxPrice)
      : minPrice;
  const resolvedMaxPrice =
    typeof minPrice === "number" && typeof maxPrice === "number"
      ? Math.max(minPrice, maxPrice)
      : maxPrice;

  return {
    q: queryText,
    categories,
    frameworks,
    complexity,
    minPrice: resolvedMinPrice,
    maxPrice: resolvedMaxPrice,
    minRating,
    sort
  };
}

export function parseCatalogQueryFromObject(
  values: Record<string, string | string[] | undefined>
): CatalogQuery {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      searchParams.set(key, value.join(","));
      continue;
    }

    if (typeof value === "string") {
      searchParams.set(key, value);
    }
  }

  return parseCatalogQueryFromSearchParams(searchParams);
}

export function filterTemplates(
  inputTemplates: Template[],
  query: CatalogQuery
): Template[] {
  const sort = query.sort ?? DEFAULT_SORT;

  const filtered = inputTemplates.filter((template) => {
    if (!matchesQuery(template, query.q)) {
      return false;
    }

    if (
      query.categories &&
      query.categories.length > 0 &&
      !query.categories.includes(template.category)
    ) {
      return false;
    }

    if (!includesAny(query.frameworks, template.frameworks)) {
      return false;
    }

    if (
      query.complexity &&
      query.complexity.length > 0 &&
      !query.complexity.includes(template.complexity)
    ) {
      return false;
    }

    if (typeof query.minPrice === "number" && template.priceCents < query.minPrice) {
      return false;
    }

    if (typeof query.maxPrice === "number" && template.priceCents > query.maxPrice) {
      return false;
    }

    if (typeof query.minRating === "number" && template.rating < query.minRating) {
      return false;
    }

    return true;
  });

  return sortTemplates(filtered, sort);
}

export function listCatalogTemplates(query: CatalogQuery): Template[] {
  return filterTemplates(templates, query);
}

export function getTemplateBySlug(slug: string): Template | undefined {
  return templates.find((template) => template.slug === slug);
}
