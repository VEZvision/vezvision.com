import { APP_ROUTES, SUPPORTED_LOCALES } from "@/routing/routes.config";
import { applyPublishedBlogVisibilityFilter } from "@/services/blogFilters";

import { getScriptSupabase } from "../lib/supabase";

export function getStaticPaths(): string[] {
  const paths: string[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const route of APP_ROUTES) {
      if (route.pageKey === "not-found" || route.pageKey === "unsubscribe") {
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
  const supabase = await getScriptSupabase();

  let blogQuery = supabase
    .from("vv_blog_posts")
    .select("slug")
    .eq("status", "published")
    .limit(100);
  blogQuery = applyPublishedBlogVisibilityFilter(blogQuery);

  const [blogResult, projectResult] = await Promise.all([
    blogQuery,
    supabase.from("vv_projects").select("slug").limit(100),
  ]);

  if (blogResult.error) {
    throw new Error(`Failed to fetch blog paths: ${blogResult.error.message}`);
  }
  if (projectResult.error) {
    throw new Error(
      `Failed to fetch portfolio paths: ${projectResult.error.message}`,
    );
  }

  for (const locale of SUPPORTED_LOCALES) {
    for (const post of blogResult.data ?? []) {
      paths.push(`/${locale}/blog/${post.slug}`);
    }
    for (const project of projectResult.data ?? []) {
      paths.push(`/${locale}/portfolio/${project.slug}`);
    }
  }

  return paths;
}
