import { cookies } from "next/headers";

import { SellerSubmissionForm } from "@/components/seller-submission-form";
import { formatCurrency } from "@/lib/format";
import { listSellerSubmissionsByEmail } from "@/lib/seller-submissions";

const SELLER_EMAIL_COOKIE = "agentvault_seller_email";

export default async function SellerPortalPage() {
  const cookieStore = await cookies();
  const sellerEmail = cookieStore.get(SELLER_EMAIL_COOKIE)?.value;
  const submissions = sellerEmail
    ? listSellerSubmissionsByEmail(sellerEmail)
    : [];

  return (
    <section>
      <header className="catalog-header">
        <p className="eyebrow">Seller portal</p>
        <h1>Submit templates for marketplace review</h1>
        <p>
          Upload a package, run automated checks, and queue your template for manual
          review within 48 hours.
        </p>
      </header>

      <section className="dashboard-panel">
        <h2>Program terms</h2>
        <p>
          Approved templates are listed with a seller revenue share of 70% per purchase.
        </p>
        <p className="muted">
          Example payout: a {formatCurrency(9900)} template yields about{" "}
          {formatCurrency(Math.round(9900 * 0.7))} before payment provider fees.
        </p>
      </section>

      <section className="detail-panel">
        <h2>Submit a template</h2>
        <p className="muted">
          Automated checks validate required files, README depth, and baseline test
          scenario coverage before manual review.
        </p>
        <SellerSubmissionForm initialEmail={sellerEmail} />
      </section>

      <section className="dashboard-panel">
        <h2>Your recent submissions</h2>
        {!sellerEmail ? (
          <p className="muted">
            Submit a template to start a seller session in this implementation
            environment.
          </p>
        ) : submissions.length === 0 ? (
          <p className="muted">No submissions yet for {sellerEmail}.</p>
        ) : (
          <div className="purchase-list">
            {submissions.map((submission) => (
              <article key={submission.id} className="purchase-item">
                <div>
                  <h3>{submission.templateTitle}</h3>
                  <p className="muted">
                    {submission.templateSlug} • {submission.category}
                  </p>
                </div>
                <div className="purchase-meta">
                  <p>Status: {submission.status.replace("-", " ")}</p>
                  <p>Submitted: {new Date(submission.createdAt).toLocaleString()}</p>
                  <p>
                    Estimated payout per sale:{" "}
                    {formatCurrency(submission.estimatedPayoutCents)}
                  </p>
                  <ul className="seller-check-list">
                    {submission.checks.map((check) => (
                      <li key={check.id}>
                        <strong>{check.label}:</strong> {check.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

