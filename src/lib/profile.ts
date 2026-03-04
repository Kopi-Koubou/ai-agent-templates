import { PurchaseRecord } from "@/lib/purchase-store";

export interface BuyerProfile {
  email: string;
  displayName: string;
  joinedAt?: string;
  purchasesCount: number;
  favoritesCount: number;
}

function toDisplayName(rawLocalPart: string): string {
  const normalized = rawLocalPart
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim();

  if (!normalized) {
    return "Buyer";
  }

  const words = normalized.split(/\s+/).slice(0, 3);
  const titled = words.map((word) =>
    word.length > 0
      ? `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`
      : word
  );

  return titled.join(" ");
}

export function getDisplayNameFromEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  const localPart = normalizedEmail.split("@")[0] ?? "";

  return toDisplayName(localPart);
}

export function buildBuyerProfile(
  email: string,
  purchases: PurchaseRecord[],
  favoriteSlugs: string[]
): BuyerProfile {
  const normalizedEmail = email.trim().toLowerCase();

  const joinedAt = purchases
    .map((purchase) => purchase.purchasedAt)
    .reduce<string | undefined>((earliest, purchasedAt) => {
      if (!earliest) {
        return purchasedAt;
      }

      return Date.parse(purchasedAt) < Date.parse(earliest)
        ? purchasedAt
        : earliest;
    }, undefined);

  return {
    email: normalizedEmail,
    displayName: getDisplayNameFromEmail(normalizedEmail),
    joinedAt,
    purchasesCount: purchases.length,
    favoritesCount: favoriteSlugs.length
  };
}
