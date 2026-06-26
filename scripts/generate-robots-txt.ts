import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const SITE_URL = (process.env.VITE_SITE_URL || "https://vezvision.com").replace(
  /\/$/,
  "",
);

const DEFAULT_ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

async function main() {
  const outPath = resolve(process.cwd(), "public", "robots.txt");
  await writeFile(outPath, DEFAULT_ROBOTS_TXT, "utf-8");
  console.log(`robots.txt written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
