import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { FavoriteToggle } from "@/components/favorite-toggle";
import { ReviewForm } from "@/components/review-form";
import { getTemplateBySlug } from "@/lib/catalog";
import { isTemplateFavoritedByEmail } from "@/lib/favorite-store";
import { formatCurrency } from "@/lib/format";
import {
  getTemplateReviewSummary,
  listReviews,
  ReviewSortMode
} from "@/lib/review-store";
import { buildTemplatePreview } from "@/lib/template-preview";

const REVIEW_SORT_MODES: ReviewSortMode[] = ["newest", "rating", "popular"];

function resolveReviewSort(rawSortValue: string | undefined): ReviewSortMode {
  if (!rawSortValue) {
    return "newest";
  }

  if (REVIEW_SORT_MODES.includes(rawSortValue as ReviewSortMode)) {
    return rawSortValue as ReviewSortMode;
  }

  return "newest";
}

interface TemplateDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TemplateDetailPage({
  params,
  searchParams
}: TemplateDetailPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams
  ]);
  const reviewSort = resolveReviewSort(
    resolvedSearchParams.reviewSort?.toString()
  );
  const template = getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  const preview = buildTemplatePreview(template);
  const reviewSummary = getTemplateReviewSummary(template);
  const reviews = listReviews(template.slug, reviewSort);
  const cookieStore = await cookies();
  const buyerEmail = cookieStore.get("agentvault_buyer_email")?.value;
  const initiallySaved =
    typeof buyerEmail === "string" &&
    isTemplateFavoritedByEmail(buyerEmail, template.slug);

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
          <p className="muted">
            {reviewSummary.averageRating.toFixed(1)} / 5 from {reviewSummary.reviewCount}{" "}
            verified reviews
          </p>
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
          <FavoriteToggle templateSlug={template.slug} initiallySaved={initiallySaved} />
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
        <h2>Screenshots</h2>
        <div className="screenshot-grid">
          {preview.screenshotUrls.map((url, index) => (
            <article key={url} className="screenshot-card">
              <p className="screenshot-label">Screenshot {index + 1}</p>
              <code>{url}</code>
            </article>
          ))}
        </div>
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

      <section className="detail-panel" id="reviews">
        <h2>Reviews</h2>
        <p className="muted">
          Average rating: {reviewSummary.averageRating.toFixed(1)} ({reviewSummary.reviewCount}{" "}
          total)
        </p>
        <nav className="review-sort-row" aria-label="Review sorting">
          <span className="muted">Sort:</span>
          <Link
            href={`/templates/${template.slug}?reviewSort=newest#reviews`}
            className={`review-sort-link ${reviewSort === "newest" ? "review-sort-link-active" : ""}`}
          >
            Newest
          </Link>
          <Link
            href={`/templates/${template.slug}?reviewSort=rating#reviews`}
            className={`review-sort-link ${reviewSort === "rating" ? "review-sort-link-active" : ""}`}
          >
            Rating
          </Link>
          <Link
            href={`/templates/${template.slug}?reviewSort=popular#reviews`}
            className={`review-sort-link ${reviewSort === "popular" ? "review-sort-link-active" : ""}`}
          >
            Most helpful
          </Link>
        </nav>
        {reviews.length === 0 ? (
          <p className="muted">No reviews yet. Purchasers can submit one below.</p>
        ) : (
          <div className="review-list">
            {reviews.map((review) => (
              <article key={review.id} className="review-item">
                <header>
                  <strong>{review.rating.toFixed(1)} / 5</strong>
                  <span className="muted">
                    {" "}
                    by {review.authorLabel} on{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  <span className="pill verified-pill">Verified Purchase</span>
                </header>
                <p>{review.comment}</p>
                {review.sellerResponse ? (
                  <p className="muted">
                    Seller response: {review.sellerResponse}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
        <ReviewForm templateSlug={template.slug} />
      </section>
    </article>
  );
}
