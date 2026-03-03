import { getTemplateBySlug } from "@/lib/catalog";

const PURCHASE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface PurchaseRecord {
  token: string;
  orderId: string;
  templateSlug: string;
  templateTitle: string;
  email: string;
  purchasedAt: string;
  expiresAt: string;
}

const purchases = new Map<string, PurchaseRecord>();

export function createPurchase(templateSlug: string, email: string): PurchaseRecord {
  const template = getTemplateBySlug(templateSlug);
  if (!template) {
    throw new Error(`Template not found: ${templateSlug}`);
  }

  const now = Date.now();
  const token = crypto.randomUUID().replace(/-/g, "");
  const orderId = `ord_${crypto.randomUUID().slice(0, 8)}`;

  const record: PurchaseRecord = {
    token,
    orderId,
    templateSlug: template.slug,
    templateTitle: template.title,
    email,
    purchasedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + PURCHASE_TTL_MS).toISOString()
  };

  purchases.set(token, record);
  return record;
}

export function getPurchaseByToken(token: string): PurchaseRecord | null {
  const record = purchases.get(token);
  if (!record) {
    return null;
  }

  if (Date.parse(record.expiresAt) < Date.now()) {
    purchases.delete(token);
    return null;
  }

  return record;
}

export function clearPurchaseStoreForTests(): void {
  purchases.clear();
}
