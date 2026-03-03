import Link from "next/link";
import { notFound } from "next/navigation";

import { getTemplateBySlug } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";

interface TemplateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TemplateDetailPage({
  params
}: TemplateDetailPageProps) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  return (
    <article className="template-detail">
      <Link href="/templates" className="inline-link">
        Back to catalog
      </Link>

      <header className="template-detail-header">
        <div>
          <p className="eyebrow">{template.category}</p>
          <h1>{template.title}</h1>
          <p>{template.longDescription}</p>
        </div>
        <aside className="price-panel">
          <p className="price">{formatCurrency(template.priceCents)}</p>
          <p className="muted">One-time purchase</p>
          <Link href="/templates" className="btn-primary">
            Browse all templates
          </Link>
        </aside>
      </header>

      <section>
        <h2>What&apos;s included</h2>
        <ul>
          {template.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Preview files</h2>
        <div className="preview-grid">
          {template.previewFiles.map((file) => (
            <article key={file.path} className="preview-card">
              <h3>{file.path}</h3>
              <p>{file.description}</p>
              <pre>{file.excerpt}</pre>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
