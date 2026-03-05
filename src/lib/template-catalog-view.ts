import { getTemplateReviewSummary } from "@/lib/review-store";
import { Template } from "@/lib/types";

export function withLiveReviewSummary(template: Template): Template {
  const summary = getTemplateReviewSummary(template);

  if (
    summary.averageRating === template.rating &&
    summary.reviewCount === template.reviewCount
  ) {
    return template;
  }

  return {
    ...template,
    rating: summary.averageRating,
    reviewCount: summary.reviewCount
  };
}

export function withLiveReviewSummaries(templates: Template[]): Template[] {
  return templates.map(withLiveReviewSummary);
}
