import { getTemplateBySlug } from "@/lib/catalog";

export const PURCHASE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface PurchaseRecord {
  token: string;
  orderId: string;
  templateSlug: string;
  templateTitle: string;
  purchasedVersion: string;
  email: string;
  purchasedAt: string;
  expiresAt: string;
  downloadCount: number;
  downloadHistory: string[];
  receiptId: string;
  receiptSentAt: string;
  lastDownloadedAt?: string;
}

export interface PurchaseReceiptPreview {
  id: string;
  to: string;
  sentAt: string;
  subject: string;
  delivery: "mock-queued";
  downloadPath: string;
  expiresAt: string;
  previewText: string;
}

const purchases = new Map<string, PurchaseRecord>();
const MAX_DOWNLOAD_HISTORY_ENTRIES = 10;

function isExpired(record: PurchaseRecord): boolean {
  return Date.parse(record.expiresAt) < Date.now();
}

export function buildPurchaseReceiptPreview(
  purchase: PurchaseRecord
): PurchaseReceiptPreview {
  return {
    id: purchase.receiptId,
    to: purchase.email,
    sentAt: purchase.receiptSentAt,
    subject: `Your AgentVault receipt for ${purchase.templateTitle}`,
    delivery: "mock-queued",
    downloadPath: `/api/download/${purchase.token}`,
    expiresAt: purchase.expiresAt,
    previewText:
      "This mock receipt confirms your purchase and includes a 30-day download link."
  };
}

export function createPurchase(templateSlug: string, email: string): PurchaseRecord {
  const template = getTemplateBySlug(templateSlug);
  if (!template) {
    throw new Error(`Template not found: ${templateSlug}`);
  }

  const now = Date.now();
  const token = crypto.randomUUID().replace(/-/g, "");
  const orderId = `ord_${crypto.randomUUID().slice(0, 8)}`;
  const receiptSentAt = new Date(now).toISOString();

  const record: PurchaseRecord = {
    token,
    orderId,
    templateSlug: template.slug,
    templateTitle: template.title,
    purchasedVersion: template.version,
    email: email.trim().toLowerCase(),
    purchasedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + PURCHASE_TTL_MS).toISOString(),
    downloadCount: 0,
    downloadHistory: [],
    receiptId: `rcpt_${crypto.randomUUID().slice(0, 10)}`,
    receiptSentAt
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

  const downloadedAt = new Date().toISOString();

  const updatedRecord: PurchaseRecord = {
    ...purchase,
    downloadCount: purchase.downloadCount + 1,
    lastDownloadedAt: downloadedAt,
    downloadHistory: [downloadedAt, ...purchase.downloadHistory].slice(
      0,
      MAX_DOWNLOAD_HISTORY_ENTRIES
    )
  };

  purchases.set(token, updatedRecord);
  return updatedRecord;
}

export function clearPurchaseStoreForTests(): void {
  purchases.clear();
}
