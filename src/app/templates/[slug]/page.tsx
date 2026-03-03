import Link from "next/link";
import { notFound } from "next/navigation";

import { getTemplateBySlug } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { buildTemplatePreview } from "@/lib/template-preview";

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

  const preview = buildTemplatePreview(template);

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
          <div className="framework-row">
            {template.frameworks.map((framework) => (
              <span key={framework} className="framework-tag">
                Compatible with {framework}
              </span>
            ))}
          </div>
        </div>
        <aside className="price-panel">
          <p className="price">{formatCurrency(template.priceCents)}</p>
          <p className="muted">One-time purchase</p>
          <Link href="/checkout" className="btn-primary">
            Buy template
          </Link>
          {preview.starterAvailable ? (
            <Link href={`/api/templates/${template.slug}/starter`} className="btn-ghost">
              Get free starter
            </Link>
          ) : null}
        </aside>
      </header>

      <section className="detail-panel">
        <h2>Demo</h2>
        <p className="muted">
          Demo asset: <code>{preview.demoAssetUrl}</code>
        </p>
        <p>
          GIF assets are represented as placeholder paths in this implementation workspace.
        </p>
      </section>

      <section className="detail-panel">
        <h2>Version history</h2>
        <ul>
          {preview.versionHistory.map((entry) => (
            <li key={entry.version}>
              <strong>{entry.version}</strong> (
              {new Date(entry.releasedAt).toLocaleDateString()}) - {entry.notes}
            </li>
          ))}
        </ul>
      </section>

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

      <section className="detail-panel">
        <h2>File tree</h2>
        <ul className="file-tree-list">
          {preview.fileTree.map((path) => (
            <li key={path}>
              <code>{path}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-panel">
        <h2>README preview</h2>
        <pre>{preview.readmePreview}</pre>
      </section>

      <section className="detail-panel">
        <h2>CUSTOMIZE preview</h2>
        <pre>{preview.customizePreview}</pre>
      </section>
    </article>
  );
}
