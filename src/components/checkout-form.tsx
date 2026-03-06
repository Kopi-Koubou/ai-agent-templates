"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { resolveInitialTemplateSlug } from "@/lib/checkout";
import {
  getPaymentMethodLabel,
  PaymentMethod,
  PAYMENT_METHODS
} from "@/lib/payment-methods";
import { Template } from "@/lib/types";

interface CheckoutFormProps {
  templates: Template[];
  initialTemplateSlug?: string;
}

interface PurchaseResponse {
  orderId: string;
  token: string;
  paymentMethod: PaymentMethod;
  downloadPath: string;
  expiresAt: string;
  license: {
    model: "per-user";
    projects: "unlimited";
    transferability: "non-transferable";
    holderEmail: string;
    grantedAt: string;
    summary: string;
  };
  receipt: {
    id: string;
    to: string;
    sentAt: string;
    subject: string;
    delivery: "mock-queued";
    paymentMethod: PaymentMethod;
    downloadPath: string;
    expiresAt: string;
    previewText: string;
  };
}

interface DownloadResponse {
  template: string;
  token: string;
  purchasedAt: string;
  expiresAt: string;
  downloadedAt?: string;
  downloadCount: number;
  downloadHistory: string[];
  downloadPath: string;
  refreshedLink: boolean;
  license: {
    model: "per-user";
    projects: "unlimited";
    transferability: "non-transferable";
    holderEmail: string;
    grantedAt: string;
    summary: string;
  };
  downloadUrl: string;
  downloadHint: string;
}

export function CheckoutForm({
  templates,
  initialTemplateSlug
}: CheckoutFormProps) {
  const [templateSlug, setTemplateSlug] = useState(() =>
    resolveInitialTemplateSlug(templates, initialTemplateSlug)
  );
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
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
          email,
          paymentMethod
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
    setPurchase((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        token: payload.token,
        downloadPath: payload.downloadPath,
        expiresAt: payload.expiresAt
      };
    });
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

        <fieldset className="payment-method-group">
          <legend>Payment method</legend>
          <div className="payment-method-list">
            {PAYMENT_METHODS.map((method) => (
              <label key={method} className="checkbox-option payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                <span>{getPaymentMethodLabel(method)}</span>
              </label>
            ))}
          </div>
        </fieldset>

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
          <p>
            Receipt queued: <code>{purchase.receipt.id}</code>
          </p>
          <p className="muted">
            Payment method: {getPaymentMethodLabel(purchase.paymentMethod)}
          </p>
          <p className="muted">License: {purchase.license.summary}</p>
          <p className="muted">
            Receipt to {purchase.receipt.to}: {purchase.receipt.subject}
          </p>
          <p className="muted">{purchase.receipt.previewText}</p>
          <div className="checkout-actions">
            <Link className="btn-ghost" href="/dashboard">
              Open buyer dashboard
            </Link>
            <button type="button" onClick={handleDownload}>
              Validate download link
            </button>
          </div>
        </div>
      ) : null}

      {download ? (
        <div className="checkout-result">
          <h3>Download ready</h3>
          <p>Template: {download.template}</p>
          <p>Purchased at: {new Date(download.purchasedAt).toLocaleString()}</p>
          {download.downloadedAt ? (
            <p>Downloaded at: {new Date(download.downloadedAt).toLocaleString()}</p>
          ) : null}
          <p>Expires: {new Date(download.expiresAt).toLocaleString()}</p>
          <p>Downloads used: {download.downloadCount}</p>
          <p>Recent download events: {download.downloadHistory.length}</p>
          {download.refreshedLink ? (
            <p className="muted">A fresh 30-day link was generated for this download.</p>
          ) : null}
          <p className="muted">License: {download.license.summary}</p>
          <p>
            Asset path: <code>{download.downloadUrl}</code>
          </p>
          <p className="muted">{download.downloadHint}</p>
        </div>
      ) : null}
    </section>
  );
}
