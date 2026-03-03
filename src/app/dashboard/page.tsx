import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { listPurchasesByEmail } from "@/lib/purchase-store";

const BUYER_EMAIL_COOKIE = "agentvault_buyer_email";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const buyerEmail = cookieStore.get(BUYER_EMAIL_COOKIE)?.value;

  if (!buyerEmail) {
    redirect("/checkout");
  }

  const purchases = listPurchasesByEmail(buyerEmail);

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
    </section>
  );
}
