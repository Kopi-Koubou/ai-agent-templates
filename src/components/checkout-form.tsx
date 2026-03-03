"use client";

import { FormEvent, useMemo, useState } from "react";

import { Template } from "@/lib/types";

interface CheckoutFormProps {
  templates: Template[];
}

interface PurchaseResponse {
  orderId: string;
  token: string;
  downloadPath: string;
  expiresAt: string;
}

interface DownloadResponse {
  template: string;
  purchasedAt: string;
  expiresAt: string;
  downloadHint: string;
}

export function CheckoutForm({ templates }: CheckoutFormProps) {
  const [templateSlug, setTemplateSlug] = useState(templates[0]?.slug ?? "");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchase, setPurchase] = useState<PurchaseResponse | null>(null);
  const [download, setDownload] = useState<DownloadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.slug === templateSlug),
    [templateSlug, templates]
  );

  async function handleCheckout(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setPurchase(null);
    setDownload(null);

    try {
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          templateSlug,
          email
        })
      });

      if (!response.ok) {
        throw new Error("Could not create purchase. Please check your inputs.");
      }

      const payload = (await response.json()) as PurchaseResponse;
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

  async function handleDownload(): Promise<void> {
    if (!purchase) {
      return;
    }

    setError(null);
    const response = await fetch(purchase.downloadPath, {
      method: "GET"
    });

    if (!response.ok) {
      setError("Download link expired or invalid.");
      return;
    }

    const payload = (await response.json()) as DownloadResponse;
    setDownload(payload);
  }

  return (
    <section className="checkout-panel">
      <h2>Checkout</h2>
      <p>Payment service is mocked for implementation testing. Flow is API-complete.</p>

      <form className="checkout-form" onSubmit={handleCheckout}>
        <label>
          Template
          <select
            value={templateSlug}
            onChange={(event) => setTemplateSlug(event.currentTarget.value)}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.slug}>
                {template.title}
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

        <button type="submit" disabled={isSubmitting || !selectedTemplate}>
          {isSubmitting ? "Processing..." : "Create mock purchase"}
        </button>
      </form>

      {error ? <p className="error-message">{error}</p> : null}

      {purchase ? (
        <div className="checkout-result">
          <h3>Purchase created</h3>
          <p>
            Order: <code>{purchase.orderId}</code>
          </p>
          <p>
            Token: <code>{purchase.token}</code>
          </p>
          <p>Expires: {new Date(purchase.expiresAt).toLocaleString()}</p>
          <button type="button" onClick={handleDownload}>
            Validate download link
          </button>
        </div>
      ) : null}

      {download ? (
        <div className="checkout-result">
          <h3>Download ready</h3>
          <p>Template: {download.template}</p>
          <p>Purchased at: {new Date(download.purchasedAt).toLocaleString()}</p>
          <p>Expires: {new Date(download.expiresAt).toLocaleString()}</p>
          <p className="muted">{download.downloadHint}</p>
        </div>
      ) : null}
    </section>
  );
}
