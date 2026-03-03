import Link from "next/link";

import { TemplateCard } from "@/components/template-card";
import { templates } from "@/data/templates";

export default function HomePage() {
  const featuredTemplates = templates.filter((template) => template.featured).slice(0, 4);

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
          <Link className="btn-primary" href="/templates">
            Browse templates
          </Link>
          <Link className="btn-ghost" href="/checkout">
            Test checkout flow
          </Link>
        </div>
      </div>

      <div className="stats-block">
        <h2>Launch catalog</h2>
        <ul>
          <li>8 templates across support, content, data, and devtools</li>
          <li>Frameworks: Claude Code, OpenClaw, LangGraph, CrewAI</li>
          <li>Preview files and tested setup guides included</li>
        </ul>
      </div>

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
