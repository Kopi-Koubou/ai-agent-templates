import { getTemplateBySlug } from "@/lib/catalog";
import { listPurchasesByEmail } from "@/lib/purchase-store";
import { buildTemplatePreview } from "@/lib/template-preview";

export interface TemplateUpdateNotification {
  id: string;
  templateSlug: string;
  templateTitle: string;
  purchasedVersion: string;
  latestVersion: string;
  purchasedAt: string;
  latestReleasedAt: string;
  latestReleaseNotes: string;
}

function parseVersionSegment(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function compareTemplateVersions(
  leftVersion: string,
  rightVersion: string
): number {
  const leftParts = leftVersion.split(".");
  const rightParts = rightVersion.split(".");

  for (let index = 0; index < 3; index += 1) {
    const diff =
      parseVersionSegment(leftParts[index]) -
      parseVersionSegment(rightParts[index]);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

export function listTemplateUpdateNotifications(
  buyerEmail: string
): TemplateUpdateNotification[] {
  const purchases = listPurchasesByEmail(buyerEmail);
  const notifications: TemplateUpdateNotification[] = [];

  for (const purchase of purchases) {
    const template = getTemplateBySlug(purchase.templateSlug);
    if (!template) {
      continue;
    }

    if (compareTemplateVersions(template.version, purchase.purchasedVersion) <= 0) {
      continue;
    }

    const preview = buildTemplatePreview(template);
    const latestVersionEntry = preview.versionHistory[0];

    notifications.push({
      id: `${purchase.orderId}:${template.version}`,
      templateSlug: template.slug,
      templateTitle: template.title,
      purchasedVersion: purchase.purchasedVersion,
      latestVersion: template.version,
      purchasedAt: purchase.purchasedAt,
      latestReleasedAt: latestVersionEntry?.releasedAt ?? template.publishedAt,
      latestReleaseNotes:
        latestVersionEntry?.notes ??
        "A new release is available with tested updates."
    });
  }

  return notifications.sort((left, right) => {
    const releaseTimeDiff =
      Date.parse(right.latestReleasedAt) - Date.parse(left.latestReleasedAt);
    if (releaseTimeDiff !== 0) {
      return releaseTimeDiff;
    }

    return Date.parse(right.purchasedAt) - Date.parse(left.purchasedAt);
  });
}
