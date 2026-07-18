import { APP_ROUTES, SUPPORTED_LOCALES } from "@/routing/routes.config";
import { applyPublishedBlogVisibilityFilter } from "@/services/blogFilters";

import { getScriptApi } from "../lib/api";

type Locale = (typeof SUPPORTED_LOCALES)[number];

interface BlogPathRow {
  slug: string;
  title_pl: string | null;
  title_en: string | null;
  content_pl: string | null;
  content_en: string | null;
}

interface ProjectPathRow {
  slug: string;
  title_pl: string | null;
  title_en: string | null;
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasBlogLocale(post: BlogPathRow, locale: Locale): boolean {
  return locale === "en"
    ? hasText(post.title_en) || hasText(post.content_en)
    : hasText(post.title_pl) || hasText(post.content_pl);
}

function hasProjectLocale(project: ProjectPathRow, locale: Locale): boolean {
  return locale === "en"
    ? hasText(project.title_en)
    : hasText(project.title_pl);
}

export function getStaticPaths(): string[] {
  const paths: string[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const route of APP_ROUTES) {
      if (route.pageKey === "unsubscribe") {
        continue;
      }
      if (route.dynamic) continue;

      const suffix = route.path === "" ? "" : `/${route.path}`;
      paths.push(`/${locale}${suffix}`);
    }
  }

  return paths;
}

export async function getDynamicPaths(): Promise<string[]> {
  const paths: string[] = [];
  const supabase = getScriptApi();

  let blogQuery = supabase
    .from<BlogPathRow[]>("vv_blog_posts")
    .select("slug,title_pl,title_en,content_pl,content_en")
    .eq("status", "published")
    .limit(100);
  blogQuery = applyPublishedBlogVisibilityFilter(blogQuery);

  const [blogResult, projectResult] = await Promise.all([
    blogQuery,
    supabase
      .from<ProjectPathRow[]>("vv_projects")
      .select("slug,title_pl,title_en")
      .limit(100),
  ]);

  if (blogResult.error) {
    throw new Error(`Failed to fetch blog paths: ${blogResult.error.message}`);
  }
  if (projectResult.error) {
    throw new Error(
      `Failed to fetch portfolio paths: ${projectResult.error.message}`,
    );
  }

  for (const post of blogResult.data ?? []) {
    for (const locale of SUPPORTED_LOCALES) {
      if (!hasBlogLocale(post, locale)) continue;
      paths.push(`/${locale}/blog/${post.slug}`);
    }
  }

  for (const project of projectResult.data ?? []) {
    for (const locale of SUPPORTED_LOCALES) {
      if (!hasProjectLocale(project, locale)) continue;
      paths.push(`/${locale}/portfolio/${project.slug}`);
    }
  }

  return paths;
}
