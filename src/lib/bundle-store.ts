import { buildBundleDetail, getBundleBySlug } from "@/lib/bundles";
import {
  buildPurchaseLicensePreview,
  buildPurchaseReceiptPreview,
  createPurchase,
  PurchaseLicensePreview,
  PurchaseReceiptPreview
} from "@/lib/purchase-store";
import { PaymentMethod } from "@/lib/payment-methods";

export interface BundlePurchaseItem {
  templateSlug: string;
  templateTitle: string;
  orderId: string;
  token: string;
  purchasedVersion: string;
  purchasedAt: string;
  expiresAt: string;
  downloadPath: string;
  paymentMethod: PaymentMethod;
  license: PurchaseLicensePreview;
  receipt: PurchaseReceiptPreview;
}

export interface BundlePurchaseRecord {
  bundleOrderId: string;
  bundleSlug: string;
  bundleTitle: string;
  email: string;
  purchasedAt: string;
  templateCount: number;
  priceCents: number;
  retailCents: number;
  savingsCents: number;
  discountPct: number;
  paymentMethod: PaymentMethod;
  items: BundlePurchaseItem[];
}

export function createBundlePurchase(
  bundleSlug: string,
  email: string,
  paymentMethod: PaymentMethod = "card"
): BundlePurchaseRecord {
  const bundle = getBundleBySlug(bundleSlug);
  if (!bundle || !bundle.isPublished) {
    throw new Error(`Bundle not found: ${bundleSlug}`);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const detail = buildBundleDetail(bundle);
  const purchases = detail.templates.map((template) =>
    createPurchase(template.slug, normalizedEmail, paymentMethod)
  );

  return {
    bundleOrderId: `bord_${crypto.randomUUID().slice(0, 8)}`,
    bundleSlug: detail.slug,
    bundleTitle: detail.title,
    email: normalizedEmail,
    purchasedAt: new Date().toISOString(),
    templateCount: purchases.length,
    priceCents: detail.priceCents,
    retailCents: detail.pricing.retailCents,
    savingsCents: detail.pricing.savingsCents,
    discountPct: detail.discountPct,
    paymentMethod,
    items: purchases.map((purchase) => ({
      templateSlug: purchase.templateSlug,
      templateTitle: purchase.templateTitle,
      orderId: purchase.orderId,
      token: purchase.token,
      purchasedVersion: purchase.purchasedVersion,
      purchasedAt: purchase.purchasedAt,
      expiresAt: purchase.expiresAt,
      downloadPath: `/api/download/${purchase.token}`,
      paymentMethod: purchase.paymentMethod,
      license: buildPurchaseLicensePreview(purchase),
      receipt: buildPurchaseReceiptPreview(purchase)
    }))
  };
}
