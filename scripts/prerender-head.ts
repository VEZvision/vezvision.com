import { chromium, type Page } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import { getScriptSupabase } from "./lib/supabase";
import { APP_ROUTES, SUPPORTED_LOCALES } from "@/routing/routes.config";
import { applyPublishedBlogVisibilityFilter } from "@/services/blogFilters";

const DIST_DIR = resolve(process.cwd(), "dist");
const PREVIEW_PORT = 4173;
const NAV_TIMEOUT = 20_000;
const SKIP_URLS = ["https://example.supabase.co", ""];

function getStaticPaths(): string[] {
  const paths: string[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const route of APP_ROUTES) {
      if (route.pageKey === "not-found" || route.pageKey === "unsubscribe")
        continue;
      if (route.dynamic) continue;

      const suffix = route.path === "" ? "" : `/${route.path}`;
      paths.push(`/${locale}${suffix}`);
    }
  }

  return paths;
}

async function getDynamicPaths(): Promise<string[]> {
  const paths: string[] = [];

  try {
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

    for (const locale of SUPPORTED_LOCALES) {
      for (const post of blogResult.data ?? []) {
        paths.push(`/${locale}/blog/${post.slug}`);
      }
      for (const project of projectResult.data ?? []) {
        paths.push(`/${locale}/portfolio/${project.slug}`);
      }
    }
  } catch {
    // Supabase unavailable — skip dynamic paths
  }

  return paths;
}

function buildPrerenderedHtml(
  headHtml: string,
  htmlLang: string,
  bodyHtml: string,
): string {
  return `<!doctype html>\n<html lang="${htmlLang}">\n${headHtml}\n${bodyHtml}\n</html>`;
}

async function prerenderRoute(
  page: Page,
  routePath: string,
  port: number,
): Promise<boolean> {
  const url = `http://127.0.0.1:${port}${routePath}`;

  try {
    await page.goto(url, {
      timeout: NAV_TIMEOUT,
      waitUntil: "domcontentloaded",
    });
  } catch {
    console.warn(`  skip: ${routePath} (navigation timeout)`);
    return false;
  }

  try {
    await page.waitForSelector('meta[property="og:title"]', {
      timeout: 15_000,
    });
  } catch {
    const pageTitle = await page.title();
    console.warn(
      `  skip: ${routePath} (no OG title within 15s — page title: "${pageTitle}")`,
    );
    return false;
  }

  const headHtml: string = await page.evaluate(() => document.head.outerHTML);
  const htmlLang: string = await page.evaluate(
    () => document.documentElement.lang || "pl",
  );
  const bodyHtml: string = await page.evaluate(() => document.body.outerHTML);

  const prerendered = buildPrerenderedHtml(headHtml, htmlLang, bodyHtml);

  const outDir = join(DIST_DIR, routePath.slice(1));
  const outPath = join(outDir, "index.html");

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, prerendered, "utf-8");

  return true;
}

async function waitForServer(url: string, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return false;
}

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim() ?? "";

  if (SKIP_URLS.includes(supabaseUrl)) {
    console.log(
      "Skipping prerendering — VITE_SUPABASE_URL not configured (test/placeholder env)",
    );
    return;
  }

  const template = await readFile(join(DIST_DIR, "index.html"), "utf-8");

  if (!template.includes('<div id="root"')) {
    console.error(
      "dist/index.html is missing or invalid — run vite build first",
    );
    process.exit(0);
  }

  const staticPaths = getStaticPaths();
  const dynamicPaths = await getDynamicPaths();
  const allPaths = [...staticPaths, ...dynamicPaths];

  console.log(
    `Prerendering ${allPaths.length} routes (${staticPaths.length} static + ${dynamicPaths.length} dynamic)...`,
  );

  const previewProcess = spawn(
    "./node_modules/.bin/vite",
    [
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      String(PREVIEW_PORT),
      "--strictPort",
    ],
    { cwd: process.cwd(), stdio: "pipe" },
  );

  const serverReady = await waitForServer(
    `http://127.0.0.1:${PREVIEW_PORT}/`,
    30_000,
  );

  if (!serverReady) {
    console.warn("vite preview server did not start — skipping prerendering");
    previewProcess.kill();
    return;
  }

  console.log("Preview server ready");

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    console.warn(
      "Chromium not available — skipping prerendering. Run: npx playwright install chromium",
    );
    previewProcess.kill();
    return;
  }

  const page = await browser.newPage();
  let successCount = 0;
  let skipCount = 0;

  for (const routePath of allPaths) {
    const ok = await prerenderRoute(page, routePath, PREVIEW_PORT);
    if (ok) {
      successCount++;
      console.log(`  done: ${routePath}`);
    } else {
      skipCount++;
    }
  }

  await page.close();
  await browser.close();
  previewProcess.kill();

  console.log(
    `\nPrerendered ${successCount}/${allPaths.length} routes (${skipCount} skipped)`,
  );
}

main().catch((err) => {
  console.warn(
    "Prerendering skipped:",
    err instanceof Error ? err.message : String(err),
  );
  process.exit(0);
});
