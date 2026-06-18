import { getScriptSupabase } from "../lib/supabase";
import { APP_ROUTES, SUPPORTED_LOCALES } from "@/routing/routes.config";
import { localizedPath } from "@/routing/locale";
import { applyPublishedBlogVisibilityFilter } from "@/services/blogFilters";

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

      return `  <url>\n    <loc>${escapeXml(route.url)}</loc>${lastmodTag}${changefreqTag}${priorityTag}${imageTag}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>`;
}
export async function generateSitemap(): Promise<string> {
  const supabase = await getScriptSupabase();
  let blogQuery = supabase
    .from("vv_blog_posts")
    .select("slug,updated_at,featured_image,title_pl,title_en")
    .eq("status", "published")
    .limit(100);

  blogQuery = applyPublishedBlogVisibilityFilter(blogQuery);

  const [{ data: posts }, { data: projects }, { data: siteSettings }] =
    await Promise.all([
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
        });
      }
    }
  }

  return buildSitemapXml(routes);
}
