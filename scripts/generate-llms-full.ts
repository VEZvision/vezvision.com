import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getScriptSupabase } from "./lib/supabase";

const SITE_URL = (process.env.VITE_SITE_URL || "https://vezvision.com").replace(
  /\/$/,
  "",
);

interface ServiceRow {
  slug: string;
  title_pl: string | null;
  title_en: string | null;
  short_desc_pl: string | null;
  short_desc_en: string | null;
  description_pl: string | null;
  description_en: string | null;
}

interface ProjectRow {
  slug: string;
  title_pl: string | null;
  title_en: string | null;
  short_desc_pl: string | null;
  short_desc_en: string | null;
  description_pl: string | null;
  description_en: string | null;
  client_name: string | null;
}

interface BlogRow {
  slug: string;
  title_pl: string | null;
  title_en: string | null;
  excerpt_pl: string | null;
  excerpt_en: string | null;
  content_pl: string | null;
  content_en: string | null;
}

interface FaqRow {
  id: string;
  question_pl: string;
  question_en: string | null;
  answer_pl: string;
  answer_en: string | null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const sliced = text.slice(0, max);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced) + "...";
}

async function fetchServices() {
  try {
    const supabase = await getScriptSupabase();
    const { data, error } = await supabase
      .from("vv_services")
      .select(
        "slug,title_pl,title_en,short_desc_pl,short_desc_en,description_pl,description_en",
      )
      .eq("status", "active")
      .order("order_index", { ascending: true })
      .limit(20);

    if (error) throw error;
    return (data || []) as ServiceRow[];
  } catch {
    return [];
  }
}

async function fetchProjects() {
  try {
    const supabase = await getScriptSupabase();
    const { data, error } = await supabase
      .from("vv_projects")
      .select(
        "slug,title_pl,title_en,short_desc_pl,short_desc_en,description_pl,description_en,client_name",
      )
      .eq("status", "published")
      .order("order_index", { ascending: true })
      .limit(20);

    if (error) throw error;
    return (data || []) as ProjectRow[];
  } catch {
    return [];
  }
}

async function fetchBlogPosts() {
  try {
    const supabase = await getScriptSupabase();
    const { data, error } = await supabase
      .from("vv_blog_posts")
      .select(
        "slug,title_pl,title_en,excerpt_pl,excerpt_en,content_pl,content_en",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    return (data || []) as BlogRow[];
  } catch {
    return [];
  }
}

async function fetchFaqItems() {
  try {
    const supabase = await getScriptSupabase();
    const { data, error } = await supabase
      .from("vv_faq_items")
      .select("id,question_pl,question_en,answer_pl,answer_en")
      .eq("is_active", true)
      .order("order_index", { ascending: true })
      .limit(30);

    if (error) throw error;
    return (data || []) as FaqRow[];
  } catch {
    return [];
  }
}

function buildLlmsFull(
  services: ServiceRow[],
  projects: ProjectRow[],
  blogPosts: BlogRow[],
  faqItems: FaqRow[],
): string {
  const lines: string[] = [];

  lines.push(`# VEZvision — Full Content for AI Systems`);
  lines.push("");
  lines.push(
    `> VEZvision is a Polish technology company that builds modern websites, web applications, and AI/automation solutions for businesses. This file contains the full content of our most important pages for AI corpus ingestion.`,
  );
  lines.push("");

  if (services.length > 0) {
    lines.push(`## Services`);
    lines.push("");
    for (const s of services) {
      const title = s.title_en || s.title_pl || s.slug;
      const desc = s.short_desc_en || s.short_desc_pl || "";
      const fullDesc = stripHtml(s.description_en || s.description_pl || "");
      lines.push(`### ${title}`);
      lines.push("");
      lines.push(`URL: ${SITE_URL}/en/services`);
      lines.push("");
      if (desc) lines.push(`${desc}`);
      if (fullDesc) lines.push("");
      if (fullDesc) lines.push(truncate(fullDesc, 2000));
      lines.push("");
    }
  }

  if (projects.length > 0) {
    lines.push(`## Portfolio / Case Studies`);
    lines.push("");
    for (const p of projects) {
      const title = p.title_en || p.title_pl || p.slug;
      const desc = p.short_desc_en || p.short_desc_pl || "";
      const fullDesc = stripHtml(p.description_en || p.description_pl || "");
      lines.push(`### ${title}`);
      lines.push("");
      lines.push(`URL: ${SITE_URL}/en/portfolio/${p.slug}`);
      if (p.client_name) lines.push(`Client: ${p.client_name}`);
      lines.push("");
      if (desc) lines.push(`${desc}`);
      if (fullDesc) lines.push("");
      if (fullDesc) lines.push(truncate(fullDesc, 2000));
      lines.push("");
    }
  }

  if (blogPosts.length > 0) {
    lines.push(`## Blog Posts`);
    lines.push("");
    for (const b of blogPosts) {
      const title = b.title_en || b.title_pl || b.slug;
      const excerpt = b.excerpt_en || b.excerpt_pl || "";
      const content = stripHtml(b.content_en || b.content_pl || "");
      lines.push(`### ${title}`);
      lines.push("");
      lines.push(`URL: ${SITE_URL}/en/blog/${b.slug}`);
      lines.push("");
      if (excerpt) lines.push(`${excerpt}`);
      if (content) lines.push("");
      if (content) lines.push(truncate(content, 3000));
      lines.push("");
    }
  }

  if (faqItems.length > 0) {
    lines.push(`## Frequently Asked Questions`);
    lines.push("");
    for (const f of faqItems) {
      const q = f.question_en || f.question_pl;
      const a = stripHtml(f.answer_en || f.answer_pl || "");
      lines.push(`### ${q}`);
      lines.push("");
      if (a) lines.push(a);
      lines.push("");
    }
  }

  lines.push(`## Contact`);
  lines.push("");
  lines.push(`Email: contact@vezvision.com`);
  lines.push(`Website: ${SITE_URL}`);
  lines.push(`Contact form: ${SITE_URL}/en/contact`);
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const [services, projects, blogPosts, faqItems] = await Promise.all([
    fetchServices(),
    fetchProjects(),
    fetchBlogPosts(),
    fetchFaqItems(),
  ]);

  const content = buildLlmsFull(services, projects, blogPosts, faqItems);
  const outPath = resolve(process.cwd(), "public", "llms-full.txt");
  await writeFile(outPath, content, "utf-8");
  console.log(`llms-full.txt written to ${outPath} (${content.length} chars)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
