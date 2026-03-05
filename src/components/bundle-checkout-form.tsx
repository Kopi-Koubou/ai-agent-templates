"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { resolveInitialBundleSlug } from "@/lib/checkout";
import { formatCurrency } from "@/lib/format";
import { BundleDetail } from "@/lib/bundles";

interface BundleCheckoutFormProps {
  bundles: BundleDetail[];
  initialBundleSlug?: string;
}

interface BundlePurchaseResponse {
  bundleOrderId: string;
  bundleSlug: string;
  bundleTitle: string;
  purchasedAt: string;
  templateCount: number;
  priceCents: number;
  retailCents: number;
  savingsCents: number;
  discountPct: number;
  items: Array<{
    templateSlug: string;
    templateTitle: string;
    token: string;
    orderId: string;
    expiresAt: string;
    downloadPath: string;
  }>;
}

export function BundleCheckoutForm({
  bundles,
  initialBundleSlug
}: BundleCheckoutFormProps) {
  const [bundleSlug, setBundleSlug] = useState(() =>
    resolveInitialBundleSlug(bundles, initialBundleSlug)
  );
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchase, setPurchase] = useState<BundlePurchaseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedBundle = useMemo(
    () => bundles.find((bundle) => bundle.slug === bundleSlug),
    [bundleSlug, bundles]
  );

  async function handleBundleCheckout(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (!selectedBundle) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setPurchase(null);

    try {
      const response = await fetch(`/api/bundles/${selectedBundle.slug}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error("Could not create bundle purchase. Please check your inputs.");
      }

      const payload = (await response.json()) as BundlePurchaseResponse;
      setPurchase(payload);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unexpected error. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (bundles.length === 0) {
    return null;
  }

  return (
    <section className="checkout-panel">
      <h2>Bundle checkout</h2>
      <p>Buy multiple templates at discounted pricing in one flow.</p>

      <form className="checkout-form" onSubmit={handleBundleCheckout}>
        <label>
          Bundle
          <select
            value={bundleSlug}
            onChange={(event) => setBundleSlug(event.currentTarget.value)}
          >
            {bundles.map((bundle) => (
              <option key={bundle.slug} value={bundle.slug}>
                {bundle.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            placeholder="founder@company.com"
            required
          />
        </label>

        {selectedBundle ? (
          <p className="muted">
            {selectedBundle.templates.length} templates for{" "}
            {formatCurrency(selectedBundle.priceCents)} (save{" "}
            {formatCurrency(selectedBundle.pricing.savingsCents)})
          </p>
        ) : null}

        <button type="submit" disabled={isSubmitting || !selectedBundle}>
          {isSubmitting ? "Processing..." : "Create bundle purchase"}
        </button>
      </form>

      {error ? <p className="error-message">{error}</p> : null}

      {purchase ? (
        <div className="checkout-result">
          <h3>Bundle purchase created</h3>
          <p>
            Bundle order: <code>{purchase.bundleOrderId}</code>
          </p>
          <p>
            Price paid: {formatCurrency(purchase.priceCents)} (retail{" "}
            {formatCurrency(purchase.retailCents)})
          </p>
          <p className="muted">
            Savings: {formatCurrency(purchase.savingsCents)} ({purchase.discountPct}
            % bundle discount target)
          </p>
          <p className="muted">
            Purchased at: {new Date(purchase.purchasedAt).toLocaleString()}
          </p>
          <div className="purchase-list">
            {purchase.items.map((item) => (
              <article key={item.token} className="purchase-item">
                <div>
                  <h3>{item.templateTitle}</h3>
                  <p className="muted">Order {item.orderId}</p>
                  <p className="muted">
                    Expires: {new Date(item.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="purchase-meta">
                  <p>
                    Download: <code>{item.downloadPath}</code>
                  </p>
                  <Link className="inline-link" href={item.downloadPath} prefetch={false}>
                    Validate download link
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <Link className="btn-ghost" href="/dashboard">
            Open buyer dashboard
          </Link>
        </div>
      ) : null}
    </section>
  );
}
