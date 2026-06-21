import { getScriptSupabase } from "../lib/supabase";
import { APP_ROUTES, SUPPORTED_LOCALES } from "@/routing/routes.config";
import { localizedPath } from "@/routing/locale";
import { applyPublishedBlogVisibilityFilter } from "@/services/blogFilters";

export interface SitemapAlternate {
  hreflang: string;
  href: string;
}

export interface SitemapRoute {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  image?: {
    loc: string;
    caption?: string;
    title?: string;
  };
  alternates?: SitemapAlternate[];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSitemapXml(routes: SitemapRoute[]): string {
  const urls = routes
    .map((route) => {
      const lastmodTag = route.lastmod
        ? `\n    <lastmod>${route.lastmod}</lastmod>`
        : "";
      const changefreqTag = route.changefreq
        ? `\n    <changefreq>${route.changefreq}</changefreq>`
        : "";
      const priorityTag =
        route.priority !== undefined
          ? `\n    <priority>${route.priority}</priority>`
          : "";
      const imageTag = route.image
        ? `\n    <image:image>\n      <image:loc>${escapeXml(route.image.loc)}</image:loc>${route.image.caption ? `\n      <image:caption>${escapeXml(route.image.caption)}</image:caption>` : ""}${route.image.title ? `\n      <image:title>${escapeXml(route.image.title)}</image:title>` : ""}\n    </image:image>`
        : "";
      const alternatesTag = route.alternates
        ? route.alternates
            .map(
              (alt) =>
                `\n    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}" />`,
            )
            .join("")
        : "";

      return `  <url>\n    <loc>${escapeXml(route.url)}</loc>${lastmodTag}${changefreqTag}${priorityTag}${imageTag}${alternatesTag}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`;
}
function buildAlternates(
  baseUrl: string,
  pathSuffix: string,
): SitemapAlternate[] {
  const alternates: SitemapAlternate[] = SUPPORTED_LOCALES.map((locale) => ({
    hreflang: locale,
    href: `${baseUrl}${localizedPath(locale, pathSuffix)}`,
  }));
  alternates.push({
    hreflang: "x-default",
    href: `${baseUrl}${localizedPath("en", pathSuffix)}`,
  });
  return alternates;
}

export async function generateSitemap(): Promise<string> {
  // Graceful degradation: if Supabase is unreachable (no .env, network issue),
  // generate a static-only sitemap (APP_ROUTES × SUPPORTED_LOCALES) without
  // dynamic blog/portfolio URLs. This ensures `npm run build` always produces
  // a valid sitemap.xml even without Supabase credentials.
  let posts: Array<{
    slug: string;
    updated_at: string;
    featured_image: string | null;
    title_pl: string | null;
    title_en: string | null;
  }> | null = null;
  let projects: Array<{
    slug: string;
    updated_at: string;
    cover_image: string | null;
    title_pl: string | null;
    title_en: string | null;
  }> | null = null;
  let siteSettings: { value: unknown; updated_at: string } | null = null;

  try {
    const supabase = await getScriptSupabase();
    let blogQuery = supabase
      .from("vv_blog_posts")
      .select("slug,updated_at,featured_image,title_pl,title_en")
      .eq("status", "published")
      .limit(100);

    blogQuery = applyPublishedBlogVisibilityFilter(blogQuery);

    const [blogResult, projectsResult, settingsResult] = await Promise.all([
      blogQuery,
      supabase
        .from("vv_projects")
        .select("slug,updated_at,cover_image,title_pl,title_en")
        .limit(100),
      supabase
        .from("vv_site_settings")
        .select("value,updated_at")
        .eq("key", "seo")
        .single(),
    ]);

    posts = blogResult.data;
    projects = projectsResult.data;
    siteSettings = settingsResult.data;
  } catch {
    // Supabase unavailable — static-only sitemap (no blog/portfolio URLs)
  }

  const baseUrl = (
    ((siteSettings?.value as Record<string, unknown>)?.siteUrl as string) ||
    process.env.VITE_SITE_URL ||
    "https://vezvision.com"
  ).replace(/\/$/, "");

  const settingsLastmod = siteSettings?.updated_at
    ? new Date(siteSettings.updated_at).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const routes: SitemapRoute[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const route of APP_ROUTES) {
      if (!route.sitemap || route.dynamic) continue;

      routes.push({
        url: `${baseUrl}${localizedPath(locale, route.path)}`,
        lastmod: settingsLastmod,
        changefreq: route.sitemap.changefreq,
        priority: route.sitemap.priority,
        alternates: buildAlternates(baseUrl, route.path),
      });
    }
  }

  if (posts) {
    for (const post of posts) {
      for (const locale of SUPPORTED_LOCALES) {
        const postTitle =
          (locale === "en" ? post.title_en || post.title_pl : post.title_pl) ||
          post.slug;
        routes.push({
          url: `${baseUrl}${localizedPath(locale, `blog/${post.slug}`)}`,
          lastmod: post.updated_at
            ? new Date(post.updated_at).toISOString().split("T")[0]
            : undefined,
          changefreq: "monthly",
          priority: 0.7,
          image: post.featured_image
            ? {
                loc: post.featured_image,
                title: postTitle,
              }
            : undefined,
          alternates: buildAlternates(baseUrl, `blog/${post.slug}`),
        });
      }
    }
  }

  if (projects) {
    for (const project of projects) {
      for (const locale of SUPPORTED_LOCALES) {
        const projectTitle =
          (locale === "en"
            ? project.title_en || project.title_pl
            : project.title_pl) || project.slug;
        routes.push({
          url: `${baseUrl}${localizedPath(locale, `portfolio/${project.slug}`)}`,
          lastmod: project.updated_at
            ? new Date(project.updated_at).toISOString().split("T")[0]
            : undefined,
          changefreq: "monthly",
          priority: 0.7,
          image: project.cover_image
            ? {
                loc: project.cover_image,
                title: projectTitle,
              }
            : undefined,
          alternates: buildAlternates(baseUrl, `portfolio/${project.slug}`),
        });
      }
    }
  }

  return buildSitemapXml(routes);
}
