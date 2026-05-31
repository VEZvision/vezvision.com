import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/logger';
import { isAbortLikeError } from './utils';
import {
  PortfolioProject,
  ProjectTranslation,
  PortfolioFilter,
  PortfolioProjectStatus
} from '@/types/portfolio';

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
  vv_project_category_assignments?: { vv_project_categories: { slug: string } }[];
  vv_project_images?: {
    id: string;
    path: string;
    type: string;
    order_index: number;
    alt_pl?: string;
    alt_en?: string;
    created_at: string;
  }[];
}

const mapProjectFromDB = (data: DBProject): PortfolioProject => {
  const translations: Record<'pl' | 'en', ProjectTranslation> = {
    pl: {
      title: data.title_pl || '',
      short_description: data.short_desc_pl || '',
      description: data.description_pl || '',
      challenge: data.challenge_pl,
      solution: data.solution_pl,
      seo_title: data.seo_title_pl,
      seo_description: data.seo_desc_pl,
    },
    en: {
      title: data.title_en || '',
      short_description: data.short_desc_en || '',
      description: data.description_en || '',
      challenge: data.challenge_en,
      solution: data.solution_en,
      seo_title: data.seo_title_en,
      seo_description: data.seo_desc_en,
    }
  };

  const categoryAssignments = data.vv_project_category_assignments || [];
  const category = categoryAssignments.length > 0 && categoryAssignments[0].vv_project_categories
    ? categoryAssignments[0].vv_project_categories.slug
    : 'websites';

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
    images: (data.vv_project_images || []).map(img => ({
      id: img.id,
      path: img.path,
      type: img.type as PortfolioProject['images'][0]['type'],
      order: img.order_index,
      alt_pl: img.alt_pl,
      alt_en: img.alt_en,
      created_at: img.created_at
    })),
    technologies: []
  };
};

export async function listProjects(filter: PortfolioFilter = {}, signal?: AbortSignal): Promise<{ projects: PortfolioProject[], total: number }> {
  try {
    let query = supabase
      .from('vv_projects')
      .select(`
        *,
        vv_project_category_assignments(vv_project_categories(slug)),
        vv_project_images(*)
      `, { count: 'exact' })
      .limit(100)
      .abortSignal(signal);

    if (filter.category && filter.category !== 'all') {
      query = query.eq('vv_project_category_assignments.vv_project_categories.slug', filter.category);
    }
    if (filter.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }
    if (filter.featured !== undefined) {
      query = query.eq('featured', filter.featured);
    }
    if (filter.search) {
      query = query.or(`slug.ilike.%${filter.search}%,client_name.ilike.%${filter.search}%`);
    }

    query = query.order('order_index', { ascending: true });

    if (filter.limit) {
      const from = filter.offset || 0;
      const to = from + filter.limit - 1;
      query = query.range(from, to);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      projects: (data || []).map(p => mapProjectFromDB(p as unknown as DBProject)),
      total: count || 0
    };
  } catch (error: unknown) {
    if (isAbortLikeError(error)) {
      throw new Error('Request aborted');
    }
    logError('portfolio.list', error);
    throw new Error('Failed to list projects');
  }
}

export async function getProject(idOrSlug: string, signal?: AbortSignal): Promise<PortfolioProject | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    let query = supabase
      .from('vv_projects')
      .select(`
        *,
        vv_project_category_assignments(vv_project_categories(slug)),
        vv_project_images(*)
      `)
      .abortSignal(signal);

    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    if (!data) return null;

    return mapProjectFromDB(data as unknown as DBProject);
  } catch (error: unknown) {
    if (isAbortLikeError(error)) {
      throw new Error('Request aborted');
    }
    logError('portfolio.get', error);
    throw new Error('Failed to get project');
  }
}

export function getProjectImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const { data } = supabase.storage.from('vv-portfolio-images').getPublicUrl(path);
  return data.publicUrl;
}
