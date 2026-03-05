import { TemplateCard } from "@/components/template-card";
import { templates } from "@/data/templates";
import { filterTemplates, parseCatalogQueryFromObject } from "@/lib/catalog";
import { withLiveReviewSummaries } from "@/lib/template-catalog-view";

interface TemplatesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface FilterOption {
  value: string;
  label: string;
}

const CATEGORY_OPTIONS: FilterOption[] = [
  { value: "support", label: "Support" },
  { value: "content", label: "Content" },
  { value: "data", label: "Data" },
  { value: "devtools", label: "Devtools" }
];

const FRAMEWORK_OPTIONS: FilterOption[] = [
  { value: "claude-code", label: "Claude Code" },
  { value: "openclaw", label: "OpenClaw" },
  { value: "langgraph", label: "LangGraph" },
  { value: "crewai", label: "CrewAI" }
];

const COMPLEXITY_OPTIONS: FilterOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" }
];

function readMultiValue(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  const entries = Array.isArray(value) ? value : [value];
  const normalized = entries
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(normalized));
}

export default async function TemplatesPage({
  searchParams
}: TemplatesPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = parseCatalogQueryFromObject(resolvedSearchParams);
  const results = filterTemplates(withLiveReviewSummaries(templates), query);
  const selectedCategories = readMultiValue(resolvedSearchParams.category);
  const selectedFrameworks = readMultiValue(resolvedSearchParams.framework);
  const selectedComplexity = readMultiValue(resolvedSearchParams.complexity);

  return (
    <section>
      <header className="catalog-header">
        <p className="eyebrow">Catalog</p>
        <h1>Discover production-ready templates</h1>
        <p>Filter by framework, complexity, price, and use case.</p>
      </header>

      <form className="filters" method="GET">
        <label>
          Search
          <input
            type="search"
            name="q"
            defaultValue={resolvedSearchParams.q?.toString() ?? ""}
            placeholder="customer support, code review, lead enrichment"
          />
        </label>

        <fieldset className="filter-group">
          <legend>Category</legend>
          <div className="checkbox-list">
            {CATEGORY_OPTIONS.map((option) => (
              <label key={option.value} className="checkbox-option">
                <input
                  type="checkbox"
                  name="category"
                  value={option.value}
                  defaultChecked={selectedCategories.includes(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="filter-group">
          <legend>Framework</legend>
          <div className="checkbox-list">
            {FRAMEWORK_OPTIONS.map((option) => (
              <label key={option.value} className="checkbox-option">
                <input
                  type="checkbox"
                  name="framework"
                  value={option.value}
                  defaultChecked={selectedFrameworks.includes(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="filter-group">
          <legend>Complexity</legend>
          <div className="checkbox-list">
            {COMPLEXITY_OPTIONS.map((option) => (
              <label key={option.value} className="checkbox-option">
                <input
                  type="checkbox"
                  name="complexity"
                  value={option.value}
                  defaultChecked={selectedComplexity.includes(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Min Price (USD)
          <input
            type="number"
            name="minPrice"
            min="0"
            step="1"
            defaultValue={resolvedSearchParams.minPrice?.toString() ?? ""}
            placeholder="29"
          />
        </label>

        <label>
          Max Price (USD)
          <input
            type="number"
            name="maxPrice"
            min="0"
            step="1"
            defaultValue={resolvedSearchParams.maxPrice?.toString() ?? ""}
            placeholder="199"
          />
        </label>

        <label>
          Minimum Rating
          <input
            type="number"
            name="minRating"
            min="0"
            max="5"
            step="0.1"
            defaultValue={resolvedSearchParams.minRating?.toString() ?? ""}
            placeholder="4.5"
          />
        </label>

        <label>
          Sort
          <select name="sort" defaultValue={resolvedSearchParams.sort?.toString() ?? "featured"}>
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Top Rated</option>
          </select>
        </label>

        <button type="submit">Apply filters</button>
      </form>

      <p className="result-count">{results.length} templates found</p>

      {results.length === 0 ? (
        <section className="detail-panel empty-state">
          <h2>No templates match these filters</h2>
          <p>
            Try removing one filter or use a broader search query to explore the full
            launch catalog.
          </p>
        </section>
      ) : (
        <div className="card-grid">
          {results.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </section>
  );
}
