export type TemplateCategory = "support" | "content" | "data" | "devtools";

export type TemplateFramework =
  | "openclaw"
  | "claude-code"
  | "langgraph"
  | "crewai";

export type Complexity = "beginner" | "intermediate" | "advanced";

export type SortMode =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "newest"
  | "popular";

export interface PreviewFile {
  path: string;
  description: string;
  excerpt: string;
}

export interface Template {
  id: string;
  slug: string;
  title: string;
  summary: string;
  longDescription: string;
  category: TemplateCategory;
  frameworks: TemplateFramework[];
  complexity: Complexity;
  priceCents: number;
  publishedAt: string;
  rating: number;
  reviewCount: number;
  version: string;
  featured: boolean;
  tags: string[];
  includes: string[];
  previewFiles: PreviewFile[];
}

export interface CatalogQuery {
  q?: string;
  categories?: TemplateCategory[];
  frameworks?: TemplateFramework[];
  complexity?: Complexity[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: SortMode;
}
