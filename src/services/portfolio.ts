import { getApiClient } from "@/lib/api";
import { publicAssetsUrl } from "@/lib/assets";
import { logError } from "@/lib/logger";
import { safeImageUrl } from "@/utils/safeHref";
import { isAbortLikeError } from "./utils";
import type {
  PortfolioProject,
  ProjectTranslation,
  PortfolioFilter,
  PortfolioProjectStatus,
} from "@/types/portfolio";

interface DBProject {
  id: string;
  slug: string;
  status: PortfolioProjectStatus;
  featured: boolean;
  order_index: number;
  demo_url?: string;
  github_url?: string;
  client_name?: string;
  cover_image?: string;
  scope?: string[];
  created_at: string;
  updated_at: string;
  title_pl?: string;
  title_en?: string;
  short_desc_pl?: string;
  short_desc_en?: string;
  description_pl?: string;
  description_en?: string;
  challenge_pl?: string;
  challenge_en?: string;
  solution_pl?: string;
  solution_en?: string;
  show_cover_image?: boolean;
  show_demo_url?: boolean;
  show_challenge?: boolean;
  show_solution?: boolean;
  seo_title_pl?: string;
  seo_title_en?: string;
  seo_desc_pl?: string;
  seo_desc_en?: string;
  vv_project_category_assignments?: {
    vv_project_categories: { slug: string };
  }[];
  vv_project_images?: {
    id: string;
    path: string;
    type: string;
    order_index: number;
    alt_pl?: string;
    alt_en?: string;
    created_at: string;
  }[];
  vv_project_technologies?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
    order_index: number;
  }[];
}

interface ProjectImageTransform {
  readonly width: number;
  readonly quality?: number;
}

const mapProjectFromDB = (data: DBProject): PortfolioProject => {
  const translations: Record<"pl" | "en", ProjectTranslation> = {
    pl: {
      title: data.title_pl || "",
      short_description: data.short_desc_pl || "",
      description: data.description_pl || "",
      challenge: data.challenge_pl,
      solution: data.solution_pl,
      seo_title: data.seo_title_pl,
      seo_description: data.seo_desc_pl,
    },
    en: {
      title: data.title_en || "",
      short_description: data.short_desc_en || "",
      description: data.description_en || "",
      challenge: data.challenge_en,
      solution: data.solution_en,
      seo_title: data.seo_title_en,
      seo_description: data.seo_desc_en,
    },
  };

  const categoryAssignments = data.vv_project_category_assignments || [];
  const category =
    categoryAssignments.length > 0 &&
    categoryAssignments[0].vv_project_categories
      ? categoryAssignments[0].vv_project_categories.slug
      : "websites";

  return {
    id: data.id,
    slug: data.slug,
    category: category,
    status: data.status,
    featured: data.featured,
    order_index: data.order_index,
    show_cover_image: data.show_cover_image ?? true,
    show_demo_url: data.show_demo_url ?? !!data.demo_url,
    show_challenge: data.show_challenge ?? true,
    show_solution: data.show_solution ?? true,
    show_github_url: !!data.github_url,
    demo_url: data.demo_url,
    github_url: data.github_url,
    client_name: data.client_name,
    cover_path: data.cover_image,
    scope: data.scope || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
    translations,
    images: (data.vv_project_images || []).map((img) => ({
      id: img.id,
      path: img.path,
      type: img.type as PortfolioProject["images"][0]["type"],
      order: img.order_index,
      alt_pl: img.alt_pl,
      alt_en: img.alt_en,
      created_at: img.created_at,
    })),
    technologies: (data.vv_project_technologies || []).map((tech) => ({
      id: tech.id,
      name: tech.name,
      color: tech.color,
      icon: tech.icon,
      order: tech.order_index,
    })),
  };
};

const PORTFOLIO_LIST_SELECT = `
  id, slug, status, featured, order_index, demo_url, github_url, client_name, cover_image,
  created_at, updated_at, title_pl, title_en, short_desc_pl, short_desc_en,
  description_pl, description_en, challenge_pl, challenge_en, solution_pl, solution_en,
  show_cover_image, show_demo_url, show_challenge, show_solution,
  seo_title_pl, seo_title_en, seo_desc_pl, seo_desc_en,
  vv_project_category_assignments(vv_project_categories(slug)),
  vv_project_images(id, path, type, order_index, alt_pl, alt_en, created_at),
  vv_project_technologies(id, name, color, icon, order_index)
`;

const PORTFOLIO_DETAIL_SELECT = `
  id, slug, status, featured, order_index, demo_url, github_url, client_name, cover_image,
  created_at, updated_at, title_pl, title_en, short_desc_pl, short_desc_en,
  description_pl, description_en, challenge_pl, challenge_en, solution_pl, solution_en,
  show_cover_image, show_demo_url, show_challenge, show_solution,
  seo_title_pl, seo_title_en, seo_desc_pl, seo_desc_en,
  vv_project_category_assignments(vv_project_categories(slug)),
  vv_project_images(id, path, type, order_index, alt_pl, alt_en, created_at),
  vv_project_technologies(id, name, color, icon, order_index)
`;

export async function listProjects(
  filter: PortfolioFilter = {},
  signal?: AbortSignal,
): Promise<{ projects: PortfolioProject[]; total: number }> {
  try {
    const api = getApiClient();
    let query = api
      .from("vv_projects")
      .select(PORTFOLIO_LIST_SELECT, { count: "exact" })
      .limit(100);

    if (signal) query = query.abortSignal(signal);

    if (filter.category && filter.category !== "all") {
      query = query.eq(
        "vv_project_category_assignments.vv_project_categories.slug",
        filter.category,
      );
    }
    if (filter.status && filter.status !== "all") {
      query = query.eq("status", filter.status);
    }
    if (filter.featured !== undefined) {
      query = query.eq("featured", filter.featured);
    }
    if (filter.search) {
      const sanitizedSearch = filter.search
        .trim()
        .slice(0, 100)
        .replace(/[%_,".()\\]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (sanitizedSearch) {
        const pattern = `%${sanitizedSearch}%`;
        query = query.or(`slug.ilike.${pattern},client_name.ilike.${pattern}`);
      }
    }

    query = query.order("order_index", { ascending: true });

    if (filter.limit) {
      const from = filter.offset || 0;
      const to = from + filter.limit - 1;
      query = query.range(from, to);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      projects: ((data || []) as unknown[]).map((p) =>
        mapProjectFromDB(p as DBProject),
      ),
      total: count || 0,
    };
  } catch (error: unknown) {
    if (isAbortLikeError(error)) {
      throw new Error("Request aborted");
    }
    logError("portfolio.list", error);
    throw new Error("Failed to list projects");
  }
}

export async function getProject(
  idOrSlug: string,
  signal?: AbortSignal,
): Promise<PortfolioProject | null> {
  try {
    const api = getApiClient();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    let query = api.from("vv_projects").select(PORTFOLIO_DETAIL_SELECT);

    if (signal) query = query.abortSignal(signal);

    if (isUuid) {
      query = query.eq("id", idOrSlug);
    } else {
      query = query.eq("slug", idOrSlug);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    if (!data) return null;

    return mapProjectFromDB(data as unknown as DBProject);
  } catch (error: unknown) {
    if (isAbortLikeError(error)) {
      throw new Error("Request aborted");
    }
    logError("portfolio.get", error);
    throw new Error("Failed to get project");
  }
}

export function getProjectImageUrl(
  path: string,
  transform?: ProjectImageTransform,
): string {
  if (!path) return "";
  void transform;

  let url = path;
  if (!path.startsWith("http://") && !path.startsWith("https://")) {
    const base = publicAssetsUrl?.replace(/\/$/, "") ?? "";
    const cleanPath = path.replace(/^\//, "");
    // Image transformations were Supabase Storage-specific. MinIO serves the original object;
    // transformations belong in the CDN if they are needed again.
    url = `${base}/vv-portfolio-images/${cleanPath}`;
  }

  return safeImageUrl(url) ?? "";
}
