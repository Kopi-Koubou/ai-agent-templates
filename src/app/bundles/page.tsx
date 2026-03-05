import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import { buildBundleCheckoutHref } from "@/lib/checkout";
import { listPublishedBundleDetails } from "@/lib/bundles";

export default function BundlesPage() {
  const bundles = listPublishedBundleDetails();

  return (
    <section>
      <header className="catalog-header">
        <p className="eyebrow">Bundles</p>
        <h1>Template bundles with discounted pricing</h1>
        <p>
          Purchase curated sets of templates in one checkout flow and unlock faster
          time-to-launch for common use cases.
        </p>
      </header>

      {bundles.length === 0 ? (
        <section className="detail-panel empty-state">
          <h2>No bundles are live right now</h2>
          <p>
            Template bundles will appear here once curated sets are published for this
            catalog.
          </p>
        </section>
      ) : (
        <div className="card-grid">
          {bundles.map((bundle) => (
            <article key={bundle.slug} className="template-card">
              <div className="template-card-header">
                <span className="pill pill-category">Bundle</span>
                <span className="pill">{bundle.templates.length} templates</span>
              </div>
              <h2>{bundle.title}</h2>
              <p>{bundle.description}</p>
              <p>
                <strong>{formatCurrency(bundle.priceCents)}</strong>
                <span className="muted"> bundle price</span>
              </p>
              <p className="muted">
                Retail {formatCurrency(bundle.pricing.retailCents)} • Save{" "}
                {formatCurrency(bundle.pricing.savingsCents)} (
                {bundle.pricing.effectiveDiscountPct}%)
              </p>
              <ul>
                {bundle.templates.slice(0, 4).map((template) => (
                  <li key={template.slug}>{template.title}</li>
                ))}
              </ul>
              <div className="card-actions">
                <Link className="card-link" href={`/bundles/${bundle.slug}`}>
                  View bundle details
                </Link>
                <Link className="btn-ghost" href={buildBundleCheckoutHref(bundle.slug)}>
                  Buy bundle
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
