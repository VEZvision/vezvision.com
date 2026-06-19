import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getScriptSupabase } from "./lib/supabase";

const DEFAULT_ROBOTS_TXT = `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /
Crawl-delay: 10

User-agent: Bytespider
Allow: /
Crawl-delay: 10

User-agent: Applebot-Extended
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Diffbot
Allow: /
Crawl-delay: 10

Sitemap: https://vezvision.com/sitemap.xml
`;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function main() {
  const supabase = await getScriptSupabase();
  const { data, error } = await supabase
    .from("vv_site_settings")
    .select("value")
    .eq("key", "seo_files")
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    console.warn("Could not fetch seo_files from CMS:", error.message);
  }

  const robotsTxt = asString(
    (data?.value as Record<string, unknown> | null)?.robotsTxt,
  );

  const outPath = resolve(process.cwd(), "public", "robots.txt");
  await writeFile(outPath, robotsTxt || DEFAULT_ROBOTS_TXT, "utf-8");
  console.log(`robots.txt written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
