import Link from "next/link";

import { TemplateCard } from "@/components/template-card";
import { templates } from "@/data/templates";
import {
  buildBundleCheckoutHref,
  buildTemplateCheckoutHref
} from "@/lib/checkout";
import { formatCurrency } from "@/lib/format";
import { listPublishedBundleDetails } from "@/lib/bundles";
import { isStarterTemplateAvailable } from "@/lib/template-preview";
import { withLiveReviewSummaries } from "@/lib/template-catalog-view";

export default function HomePage() {
  const catalogTemplates = withLiveReviewSummaries(templates);
  const featuredTemplates = catalogTemplates
    .filter((template) => template.featured)
    .slice(0, 4);
  const freeStarterCount = templates.filter((template) =>
    isStarterTemplateAvailable(template.slug)
  ).length;
  const featuredBundle = listPublishedBundleDetails()[0];
  const heroCheckoutHref =
    featuredTemplates[0] !== undefined
      ? buildTemplateCheckoutHref(featuredTemplates[0].slug)
      : "/checkout";

  return (
    <section className="home-grid">
      <div className="hero-block">
        <p className="eyebrow">AI Agent Templates Marketplace</p>
        <h1>Production-ready agent packages you can launch in under an hour.</h1>
        <p>
          AgentVault ships complete agent architectures with prompts, tools, guardrails,
          memory schema, and tested customization docs.
        </p>
        <div className="cta-row">
          <Link className="btn-ghost" href={heroCheckoutHref}>
            Start checkout
          </Link>
          <Link className="btn-primary" href="/templates">
            Browse templates
          </Link>
        </div>
      </div>

      <div className="stats-block">
        <h2>Launch catalog</h2>
        <ul>
          <li>8 templates across support, content, data, and devtools</li>
          <li>Frameworks: Claude Code, OpenClaw, LangGraph, CrewAI</li>
          <li>Preview files and tested setup guides included</li>
          <li>{freeStarterCount} templates include a free starter package</li>
        </ul>
      </div>

      {featuredBundle ? (
        <div className="stats-block">
          <h2>Bundle spotlight</h2>
          <p>
            {featuredBundle.title}: {formatCurrency(featuredBundle.priceCents)} for{" "}
            {featuredBundle.templates.length} templates.
          </p>
          <p className="muted">
            Save {formatCurrency(featuredBundle.pricing.savingsCents)} compared with
            buying standalone.
          </p>
          <div className="cta-row">
            <Link className="btn-ghost" href="/bundles">
              Browse bundles
            </Link>
            <Link
              className="btn-primary"
              href={buildBundleCheckoutHref(featuredBundle.slug)}
            >
              Buy featured bundle
            </Link>
          </div>
        </div>
      ) : null}

      <div className="section-heading">
        <h2>Featured templates</h2>
        <Link href="/templates">View full catalog</Link>
      </div>

      <div className="card-grid">
        {featuredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </section>
  );
}
