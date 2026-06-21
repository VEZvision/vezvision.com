export type ServiceStatus = "active" | "inactive";

export interface Service {
  id: string;
  slug: string;
  price: number;
  duration: string;
  status: ServiceStatus;
  is_featured: boolean;
  icon?: string | undefined;
  order_index?: number | undefined;
  created_at: string;
  updated_at: string;
}

export interface ServiceTranslation {
  id: string;
  service_id: string;
  language: "pl" | "en";
  title: string;
  description: string;
  features: string[];
  excerpt: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ServiceCategoryTranslation {
  id: string;
  category_id: string;
  language: "pl" | "en";
  name: string;
}

export interface ServiceWithDetails extends Service {
  translations: ServiceTranslation[];
  categories: ServiceCategory[];
}
