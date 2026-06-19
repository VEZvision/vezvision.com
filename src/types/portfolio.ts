export type PortfolioProjectStatus =
  | "draft"
  | "published"
  | "active"
  | "archived"
  | "coming-soon"
  | "concept"
  | "prototype";

export interface ProjectTranslation {
  title: string;
  short_description: string;
  description: string;
  challenge?: string | undefined;
  solution?: string | undefined;
  seo_title?: string | undefined;
  seo_description?: string | undefined;
  seo_keywords?: string[];
}

export interface ProjectImage {
  id: string;
  path: string;
  type: "screenshot" | "mockup" | "logo" | "banner" | "concept" | "prototype";
  order: number;
  alt_pl?: string | undefined;
  alt_en?: string | undefined;
  created_at: string;
}

export interface ProjectTechnology {
  id: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  category: string;
  status: PortfolioProjectStatus;
  featured: boolean;
  order_index: number;
  show_cover_image?: boolean;
  show_demo_url?: boolean;
  show_challenge?: boolean;
  show_solution?: boolean;
  show_github_url?: boolean;
  demo_url?: string | undefined;
  github_url?: string | undefined;
  client_name?: string | undefined;
  cover_path?: string | undefined;
  scope?: string[];
  created_at: string;
  updated_at: string;
  translations: Record<"pl" | "en", ProjectTranslation>;
  images: ProjectImage[];
  technologies: ProjectTechnology[];
}

export interface PortfolioCategory {
  id: string;
  slug: string;
  name_pl: string;
  name_en: string;
  order_index: number;
}

export interface PortfolioFilter {
  locale?: "pl" | "en";
  status?: PortfolioProjectStatus | "all";
  category?: string | "all";
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}
