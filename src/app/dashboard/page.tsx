import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getTemplateBySlug } from "@/lib/catalog";
import { listFavoritesByEmail } from "@/lib/favorite-store";
import { listPurchasesByEmail } from "@/lib/purchase-store";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const buyerEmail = cookieStore.get(BUYER_EMAIL_COOKIE)?.value;

  if (!buyerEmail) {
    redirect("/checkout");
  }

  const purchases = listPurchasesByEmail(buyerEmail);
  const favoriteTemplates = listFavoritesByEmail(buyerEmail)
    .map((slug) => getTemplateBySlug(slug))
    .filter((template) => template !== undefined);

  return (
    <section>
      <header className="catalog-header">
        <p className="eyebrow">Buyer dashboard</p>
        <h1>Your purchases</h1>
        <p>
          Session access is set after checkout in this implementation environment.
          Purchases are currently mock records stored in memory.
        </p>
      </header>

      {purchases.length === 0 ? (
        <section className="dashboard-panel">
          <p className="muted">No purchases yet for {buyerEmail}.</p>
          <Link href="/templates" className="btn-primary">
            Browse templates
          </Link>
        </section>
      ) : (
        <section className="dashboard-panel">
          <p className="muted">Signed in as {buyerEmail}</p>
          <div className="purchase-list">
            {purchases.map((purchase) => (
              <article key={purchase.token} className="purchase-item">
                <div>
                  <h2>{purchase.templateTitle}</h2>
                  <p className="muted">Order {purchase.orderId}</p>
                </div>
                <div className="purchase-meta">
                  <p>Purchased: {new Date(purchase.purchasedAt).toLocaleString()}</p>
                  <p>Downloads: {purchase.downloadCount}</p>
                  <p>Expires: {new Date(purchase.expiresAt).toLocaleDateString()}</p>
                  {(() => {
                    const template = getTemplateBySlug(purchase.templateSlug);
                    if (!template || template.version === purchase.purchasedVersion) {
                      return (
                        <p className="muted">
                          Version: {purchase.purchasedVersion} (up to date)
                        </p>
                      );
                    }

                    return (
                      <p className="update-notice">
                        Update available: {template.version} (you bought{" "}
                        {purchase.purchasedVersion})
                      </p>
                    );
                  })()}
                  <Link
                    className="inline-link"
                    href={`/api/download/${purchase.token}`}
                    prefetch={false}
                  >
                    Validate download link
                  </Link>
                  <Link
                    className="inline-link"
                    href={`/templates/${purchase.templateSlug}#reviews`}
                  >
                    Leave a review
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-panel">
        <h2>Saved templates</h2>
        {favoriteTemplates.length === 0 ? (
          <p className="muted">No favorites yet. Save templates from detail pages.</p>
        ) : (
          <div className="purchase-list">
            {favoriteTemplates.map((template) => (
              <article key={template.slug} className="purchase-item">
                <div>
                  <h3>{template.title}</h3>
                  <p className="muted">{template.summary}</p>
                </div>
                <div className="purchase-meta">
                  <p>Latest version: {template.version}</p>
                  <Link className="inline-link" href={`/templates/${template.slug}`}>
                    Open template
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
