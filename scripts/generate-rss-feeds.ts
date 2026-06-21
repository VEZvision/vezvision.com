import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { getScriptSupabase } from "./lib/supabase";
import { applyPublishedBlogVisibilityFilter } from "@/services/blogFilters";
import { SUPPORTED_LOCALES } from "@/routing/routes.config";

interface BlogPostForRSS {
  slug: string;
  title_pl: string | null;
  title_en: string | null;
  excerpt_pl: string | null;
  excerpt_en: string | null;
  published_at: string;
  updated_at: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822Date(value: string | null): string {
  if (!value) return new Date().toUTCString();
  const date = new Date(value);
  return isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

function getLocalizedTitle(
  post: BlogPostForRSS,
  language: "pl" | "en",
): string {
  if (language === "en") {
    return post.title_en || post.title_pl || "Untitled";
  }
  return post.title_pl || post.title_en || "Bez tytułu";
}

function getLocalizedExcerpt(
  post: BlogPostForRSS,
  language: "pl" | "en",
): string {
  if (language === "en") {
    return post.excerpt_en || post.excerpt_pl || "";
  }
  return post.excerpt_pl || post.excerpt_en || "";
}

async function fetchPosts(): Promise<BlogPostForRSS[]> {
  // Graceful degradation: if Supabase is unreachable, return empty array.
  // The RSS feed will contain valid channel metadata with no items.
  try {
    const supabase = await getScriptSupabase();
    let query = supabase
      .from("vv_blog_posts")
      .select(
        "slug,title_pl,title_en,excerpt_pl,excerpt_en,published_at,updated_at",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);

    query = applyPublishedBlogVisibilityFilter(query);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch blog posts: ${error.message}`);
    }

    return (data || []) as BlogPostForRSS[];
  } catch {
    // Supabase unavailable — empty feed (channel metadata only)
    return [];
  }
}

function buildFeedXml(posts: BlogPostForRSS[], language: "pl" | "en"): string {
  const baseUrl = (
    process.env.VITE_SITE_URL || "https://vezvision.com"
  ).replace(/\/$/, "");
  const localePath = `${baseUrl}/${language}`;
  const title = language === "en" ? "VezVision Blog" : "Blog VezVision";
  const description =
    language === "en"
      ? "Articles about AI, automation, web development and digital products for business."
      : "Artykuły o AI, automatyzacji, tworzeniu stron i aplikacjach dla biznesu.";

  const items = posts
    .map((post) => {
      const link = `${localePath}/blog/${post.slug}`;
      const itemTitle = escapeXml(getLocalizedTitle(post, language));
      const itemDescription = escapeXml(getLocalizedExcerpt(post, language));
      const pubDate = rfc822Date(post.published_at);
      const guid = `${link}#post`;

      return `    <item>
      <title>${itemTitle}</title>
      <link>${link}</link>
      <description>${itemDescription}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${guid}</guid>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${localePath}/blog</link>
    <description>${escapeXml(description)}</description>
    <language>${language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${localePath}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

async function main() {
  const posts = await fetchPosts();

  for (const language of SUPPORTED_LOCALES) {
    const xml = buildFeedXml(posts, language);
    const outPath = resolve(
      process.cwd(),
      "public",
      language,
      "blog",
      "feed.xml",
    );
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, xml, "utf-8");
    console.log(`RSS feed written to ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
