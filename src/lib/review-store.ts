import { Template } from "@/lib/types";
import { listPurchasesByEmail } from "@/lib/purchase-store";

export type ReviewSortMode = "newest" | "rating" | "popular";

interface ReviewRecord {
  id: string;
  templateSlug: string;
  buyerEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  helpfulVotes: number;
  verifiedPurchase: true;
  sellerResponse?: string;
  sellerRespondedAt?: string;
  isSeed: boolean;
}

export interface TemplateReview {
  id: string;
  templateSlug: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  helpfulVotes: number;
  verifiedPurchase: true;
  sellerResponse?: string;
  sellerRespondedAt?: string;
  authorLabel: string;
}

const seededReviewRecords: ReviewRecord[] = [
  {
    id: "seed_supportbot_1",
    templateSlug: "supportbot-pro",
    buyerEmail: "founder@saasops.dev",
    rating: 5,
    comment:
      "Cut our first-response setup time from days to a single afternoon. Escalation flows were already tuned.",
    createdAt: "2026-02-20T13:30:00.000Z",
    updatedAt: "2026-02-20T13:30:00.000Z",
    helpfulVotes: 14,
    verifiedPurchase: true,
    sellerResponse:
      "Great to hear. We will keep expanding the refund and abuse handling scenarios.",
    sellerRespondedAt: "2026-02-22T09:00:00.000Z",
    isSeed: true
  },
  {
    id: "seed_content_1",
    templateSlug: "contentpipeline",
    buyerEmail: "editor@growthweekly.io",
    rating: 5,
    comment:
      "The quality rubric and source-citation checks are exactly what we needed for editorial confidence.",
    createdAt: "2026-02-18T11:10:00.000Z",
    updatedAt: "2026-02-18T11:10:00.000Z",
    helpfulVotes: 11,
    verifiedPurchase: true,
    isSeed: true
  },
  {
    id: "seed_data_1",
    templateSlug: "dataentry-automator",
    buyerEmail: "ops@ledgerflow.app",
    rating: 4,
    comment:
      "Good extraction accuracy and clear exception routing. We only had to tweak two schema fields.",
    createdAt: "2026-02-14T16:45:00.000Z",
    updatedAt: "2026-02-14T16:45:00.000Z",
    helpfulVotes: 7,
    verifiedPurchase: true,
    isSeed: true
  }
];

function cloneSeededRecords(): Map<string, ReviewRecord[]> {
  const entries = new Map<string, ReviewRecord[]>();

  for (const review of seededReviewRecords) {
    const current = entries.get(review.templateSlug) ?? [];
    current.push({ ...review });
    entries.set(review.templateSlug, current);
  }

  return entries;
}

let reviewsByTemplate = cloneSeededRecords();

function maskEmail(email: string): string {
  const [localPart, domainPart] = email.split("@");
  if (!localPart || !domainPart) {
    return "Verified buyer";
  }

  if (localPart.length < 3) {
    return `v***@${domainPart}`;
  }

  return `${localPart.slice(0, 2)}***@${domainPart}`;
}

function toPublicReview(record: ReviewRecord): TemplateReview {
  return {
    id: record.id,
    templateSlug: record.templateSlug,
    rating: record.rating,
    comment: record.comment,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    helpfulVotes: record.helpfulVotes,
    verifiedPurchase: record.verifiedPurchase,
    sellerResponse: record.sellerResponse,
    sellerRespondedAt: record.sellerRespondedAt,
    authorLabel: maskEmail(record.buyerEmail)
  };
}

function sortRecords(records: ReviewRecord[], sort: ReviewSortMode): ReviewRecord[] {
  const sorted = [...records];

  if (sort === "rating") {
    return sorted.sort((a, b) => {
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }

      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }

  if (sort === "popular") {
    return sorted.sort((a, b) => {
      if (a.helpfulVotes !== b.helpfulVotes) {
        return b.helpfulVotes - a.helpfulVotes;
      }

      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }

  return sorted.sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

export function canReviewTemplate(email: string, templateSlug: string): boolean {
  return listPurchasesByEmail(email).some(
    (purchase) => purchase.templateSlug === templateSlug
  );
}

export function listReviews(
  templateSlug: string,
  sort: ReviewSortMode = "newest"
): TemplateReview[] {
  const records = reviewsByTemplate.get(templateSlug) ?? [];
  return sortRecords(records, sort).map(toPublicReview);
}

export function createReview(
  templateSlug: string,
  buyerEmail: string,
  rating: number,
  comment: string
): TemplateReview {
  const nowIso = new Date().toISOString();
  const normalizedEmail = buyerEmail.trim().toLowerCase();
  const normalizedComment = comment.trim();
  const current = reviewsByTemplate.get(templateSlug) ?? [];

  const existingIndex = current.findIndex(
    (record) =>
      !record.isSeed &&
      record.templateSlug === templateSlug &&
      record.buyerEmail === normalizedEmail
  );

  if (existingIndex >= 0) {
    const updatedRecord: ReviewRecord = {
      ...current[existingIndex],
      rating,
      comment: normalizedComment,
      updatedAt: nowIso
    };

    current[existingIndex] = updatedRecord;
    reviewsByTemplate.set(templateSlug, current);
    return toPublicReview(updatedRecord);
  }

  const createdRecord: ReviewRecord = {
    id: `rev_${crypto.randomUUID().slice(0, 10)}`,
    templateSlug,
    buyerEmail: normalizedEmail,
    rating,
    comment: normalizedComment,
    createdAt: nowIso,
    updatedAt: nowIso,
    helpfulVotes: 0,
    verifiedPurchase: true,
    isSeed: false
  };

  current.push(createdRecord);
  reviewsByTemplate.set(templateSlug, current);
  return toPublicReview(createdRecord);
}

export function setSellerResponse(
  templateSlug: string,
  reviewId: string,
  sellerResponse: string
): TemplateReview | null {
  const current = reviewsByTemplate.get(templateSlug) ?? [];
  const reviewIndex = current.findIndex((review) => review.id === reviewId);

  if (reviewIndex < 0) {
    return null;
  }

  const updatedRecord: ReviewRecord = {
    ...current[reviewIndex],
    sellerResponse: sellerResponse.trim(),
    sellerRespondedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  current[reviewIndex] = updatedRecord;
  reviewsByTemplate.set(templateSlug, current);
  return toPublicReview(updatedRecord);
}

export function getTemplateReviewSummary(template: Template): {
  averageRating: number;
  reviewCount: number;
} {
  const records = reviewsByTemplate.get(template.slug) ?? [];
  const nonSeedRecords = records.filter((record) => !record.isSeed);

  if (nonSeedRecords.length === 0) {
    return {
      averageRating: template.rating,
      reviewCount: template.reviewCount
    };
  }

  const weightedSum =
    template.rating * template.reviewCount +
    nonSeedRecords.reduce((sum, review) => sum + review.rating, 0);
  const reviewCount = template.reviewCount + nonSeedRecords.length;

  return {
    averageRating: Number((weightedSum / reviewCount).toFixed(1)),
    reviewCount
  };
}

export function clearReviewStoreForTests(): void {
  reviewsByTemplate = cloneSeededRecords();
}
