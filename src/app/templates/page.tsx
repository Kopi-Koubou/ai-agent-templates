import { TemplateCard } from "@/components/template-card";
import { listCatalogTemplates, parseCatalogQueryFromObject } from "@/lib/catalog";

interface TemplatesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TemplatesPage({
  searchParams
}: TemplatesPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = parseCatalogQueryFromObject(resolvedSearchParams);
  const results = listCatalogTemplates(query);

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

        <label>
          Category
          <select name="category" defaultValue={resolvedSearchParams.category?.toString() ?? ""}>
            <option value="">All</option>
            <option value="support">Support</option>
            <option value="content">Content</option>
            <option value="data">Data</option>
            <option value="devtools">Devtools</option>
          </select>
        </label>

        <label>
          Framework
          <select
            name="framework"
            defaultValue={resolvedSearchParams.framework?.toString() ?? ""}
          >
            <option value="">All</option>
            <option value="claude-code">Claude Code</option>
            <option value="openclaw">OpenClaw</option>
            <option value="langgraph">LangGraph</option>
            <option value="crewai">CrewAI</option>
          </select>
        </label>

        <label>
          Complexity
          <select
            name="complexity"
            defaultValue={resolvedSearchParams.complexity?.toString() ?? ""}
          >
            <option value="">All</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label>
          Sort
          <select name="sort" defaultValue={resolvedSearchParams.sort?.toString() ?? "featured"}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Top Rated</option>
          </select>
        </label>

        <button type="submit">Apply filters</button>
      </form>

      <p className="result-count">{results.length} templates found</p>

      <div className="card-grid">
        {results.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </section>
  );
}
