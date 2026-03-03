import { getTemplateBySlug } from "@/lib/catalog";

export const PURCHASE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface PurchaseRecord {
  token: string;
  orderId: string;
  templateSlug: string;
  templateTitle: string;
  email: string;
  purchasedAt: string;
  expiresAt: string;
  downloadCount: number;
  lastDownloadedAt?: string;
}

const purchases = new Map<string, PurchaseRecord>();

function isExpired(record: PurchaseRecord): boolean {
  return Date.parse(record.expiresAt) < Date.now();
}

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
    email: email.trim().toLowerCase(),
    purchasedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + PURCHASE_TTL_MS).toISOString(),
    downloadCount: 0
  };

  purchases.set(token, record);
  return record;
}

export function getPurchaseByToken(token: string): PurchaseRecord | null {
  const record = purchases.get(token);
  if (!record) {
    return null;
  }

  if (isExpired(record)) {
    purchases.delete(token);
    return null;
  }

  return record;
}

export function listPurchasesByEmail(email: string): PurchaseRecord[] {
  const normalizedEmail = email.trim().toLowerCase();
  const records: PurchaseRecord[] = [];

  for (const [token, purchase] of purchases.entries()) {
    if (isExpired(purchase)) {
      purchases.delete(token);
      continue;
    }

    if (purchase.email === normalizedEmail) {
      records.push(purchase);
    }
  }

  return records.sort(
    (a, b) => Date.parse(b.purchasedAt) - Date.parse(a.purchasedAt)
  );
}

export function recordDownload(token: string): PurchaseRecord | null {
  const purchase = getPurchaseByToken(token);
  if (!purchase) {
    return null;
  }

  const updatedRecord: PurchaseRecord = {
    ...purchase,
    downloadCount: purchase.downloadCount + 1,
    lastDownloadedAt: new Date().toISOString()
  };

  purchases.set(token, updatedRecord);
  return updatedRecord;
}

export function clearPurchaseStoreForTests(): void {
  purchases.clear();
}
