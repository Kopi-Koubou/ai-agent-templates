import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import { isStarterTemplateAvailable } from "@/lib/template-preview";
import { Template } from "@/lib/types";

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const starterAvailable = isStarterTemplateAvailable(template.slug);

  return (
    <article className="template-card">
      <div className="template-card-header">
        <span className="pill pill-category">{template.category}</span>
        <span className="pill">{template.complexity}</span>
        {starterAvailable ? <span className="pill">Free starter</span> : null}
      </div>

      <h3>{template.title}</h3>
      <p>{template.summary}</p>

      <div className="framework-row">
        {template.frameworks.map((framework) => (
          <span key={framework} className="framework-tag">
            {framework}
          </span>
        ))}
      </div>

      <div className="template-card-footer">
        <div>
          <strong>{formatCurrency(template.priceCents)}</strong>
          <span className="muted"> one-time</span>
        </div>
        <div className="rating">{template.rating.toFixed(1)} ({template.reviewCount})</div>
      </div>

      <Link className="card-link" href={`/templates/${template.slug}`}>
        View template
      </Link>
    </article>
  );
}
