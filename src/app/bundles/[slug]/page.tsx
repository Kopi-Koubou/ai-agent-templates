import Link from "next/link";
import { notFound } from "next/navigation";

import { formatCurrency } from "@/lib/format";
import { buildBundleDetail, getBundleBySlug } from "@/lib/bundles";

interface BundleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BundleDetailPage({
  params
}: BundleDetailPageProps) {
  const { slug } = await params;
  const bundle = getBundleBySlug(slug);

  if (!bundle || !bundle.isPublished) {
    notFound();
  }

  const detail = buildBundleDetail(bundle);

  return (
    <section>
      <Link href="/bundles" className="inline-link">
        Back to bundles
      </Link>

      <header className="catalog-header">
        <p className="eyebrow">Bundle</p>
        <h1>{detail.title}</h1>
        <p>{detail.description}</p>
        <p>
          <strong>{formatCurrency(detail.priceCents)}</strong>
          <span className="muted"> one-time bundle purchase</span>
        </p>
        <p className="muted">
          Retail {formatCurrency(detail.pricing.retailCents)} • Save{" "}
          {formatCurrency(detail.pricing.savingsCents)} (
          {detail.pricing.effectiveDiscountPct}%)
        </p>
      </header>

      <section className="detail-panel">
        <h2>Included templates</h2>
        <div className="purchase-list">
          {detail.templates.map((template) => (
            <article key={template.slug} className="purchase-item">
              <div>
                <h3>{template.title}</h3>
                <p className="muted">{template.summary}</p>
              </div>
              <div className="purchase-meta">
                <p>{formatCurrency(template.priceCents)} standalone</p>
                <Link className="inline-link" href={`/templates/${template.slug}`}>
                  Open template
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="detail-panel">
        <h2>Checkout</h2>
        <p className="muted">
          Use bundle checkout to generate download links for every included template.
        </p>
        <Link className="btn-primary" href={`/checkout?bundle=${detail.slug}`}>
          Buy this bundle
        </Link>
      </section>
    </section>
  );
}
