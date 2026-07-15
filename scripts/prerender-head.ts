import { chromium, type Page } from "@playwright/test";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { spawn } from "node:child_process";

import { getDynamicPaths, getStaticPaths } from "./prerender/route-paths";
import {
  attachPageDiagnostics,
  getSeoDebugSnapshot,
  SEO_READY_PREDICATE,
  type PageDiagnostics,
} from "./prerender/seo-readiness";
import { stopPreviewServer, waitForServer } from "./prerender/preview-server";
import { validateSeoRouteHtml } from "./seo-build-validation";

const DIST_DIR = resolve(process.cwd(), "dist");
const PREVIEW_PORT = 4173;
const NAV_TIMEOUT = 20_000;
const SEO_READY_TIMEOUT = 30_000;
const SKIP_URLS = ["https://api.example.test", ""];
const PREVIEW_ORIGIN = `http://127.0.0.1:${PREVIEW_PORT}`;
const SITE_ORIGIN = (
  process.env.VITE_SITE_URL || "https://vezvision.com"
).replace(/\/+$/, "");

interface PrerenderResult {
  readonly ok: boolean;
  readonly routePath: string;
  readonly reason?: string;
}

interface PrerenderRouteInput {
  readonly page: Page;
  readonly diagnostics: PageDiagnostics;
  readonly routePath: string;
  readonly port: number;
}

function buildPrerenderedHtml(
  headHtml: string,
  htmlLang: string,
  bodyHtml: string,
): string {
  return `<!doctype html>\n<html lang="${htmlLang}" data-vez-prerender="true">\n${headHtml}\n${bodyHtml}\n</html>`;
}

const HOME_ROUTE_PATHS = new Set(["/pl", "/en"]);

const NON_CRITICAL_HOME_ASSET_PATTERNS = [
  /\/assets\/AboutComparison-[^"'<>\s]+\.(?:css|js)/,
  /\/assets\/Benefits-[^"'<>\s]+\.(?:css|js)/,
  /\/assets\/Breadcrumbs-[^"'<>\s]+\.js/,
  /\/assets\/CmsPage-[^"'<>\s]+\.js/,
  /\/assets\/codeInjection-[^"'<>\s]+\.js/,
  /\/assets\/ContactSection-[^"'<>\s]+\.(?:css|js)/,
  /\/assets\/Features-[^"'<>\s]+\.(?:css|js)/,
  /\/assets\/FounderNote-[^"'<>\s]+\.(?:css|js)/,
  /\/assets\/GridBackground-[^"'<>\s]+\.css/,
  /\/assets\/loaders-[^"'<>\s]+\.js/,
  /\/assets\/maintenanceAccess-[^"'<>\s]+\.js/,
  /\/assets\/NewsletterSection-[^"'<>\s]+\.(?:css|js)/,
  /\/assets\/PageSeo-[^"'<>\s]+\.js/,
  /\/assets\/PageShell-[^"'<>\s]+\.js/,
  /\/assets\/PotentialSection-[^"'<>\s]+\.(?:css|js)/,
  /\/assets\/ProcessSection-[^"'<>\s]+\.(?:css|js)/,
  /\/assets\/ProductsSection-[^"'<>\s]+\.(?:css|js)/,
  /\/assets\/ResponsiveImage-[^"'<>\s]+\.js/,
  /\/assets\/revealRegistry-[^"'<>\s]+\.js/,
  /\/assets\/SectionBadge-[^"'<>\s]+\.js/,
  /\/assets\/SectionHeader-[^"'<>\s]+\.(?:css|js)/,
  /\/assets\/SectionReveal-[^"'<>\s]+\.js/,
  /\/assets\/vendor-api-[^"'<>\s]+\.js/,
  /\/assets\/contactValidation-[^"'<>\s]+\.js/,
  /\/assets\/index-[^"'<>\s]+\.js/,
  /\/assets\/newslette?r-[^"'<>\s]+\.js/,
  /\/assets\/useHeroContactAction-[^"'<>\s]+\.js/,
  /\/assets\/usePageSection-[^"'<>\s]+\.js/,
  /\/assets\/useReducedMotion-[^"'<>\s]+\.js/,
  /\/assets\/vendor-lenis-[^"'<>\s]+\.(?:css|js)/,
  /\/assets\/vendor-zod-[^"'<>\s]+\.js/,
  /\/assets\/vendor-sonner-[^"'<>\s]+\.js/,
];

function shouldDropHomeAssetHint(tagHtml: string): boolean {
  if (!/(?:rel=["']stylesheet["']|rel=["']modulepreload["'])/i.test(tagHtml)) {
    return false;
  }

  return NON_CRITICAL_HOME_ASSET_PATTERNS.some((pattern) =>
    pattern.test(tagHtml),
  );
}

function removeNonCriticalHomeAssetHints(
  headHtml: string,
  routePath: string,
): string {
  if (!HOME_ROUTE_PATHS.has(routePath)) {
    return headHtml;
  }

  return headHtml.replace(/<link\b[^>]*>/gi, (tagHtml) =>
    shouldDropHomeAssetHint(tagHtml) ? "" : tagHtml,
  );
}

let cachedHomeStylesheetCss: string | null = null;

async function getHomeStylesheetCss(): Promise<string> {
  if (cachedHomeStylesheetCss) return cachedHomeStylesheetCss;

  const assetsDir = join(DIST_DIR, "assets");
  const files = await readdir(assetsDir);
  const homeCssFile = files.find((file) => /^Home-.*\.css$/.test(file));
  if (!homeCssFile) {
    cachedHomeStylesheetCss = "";
    return cachedHomeStylesheetCss;
  }

  cachedHomeStylesheetCss = await readFile(
    join(assetsDir, homeCssFile),
    "utf8",
  );
  return cachedHomeStylesheetCss;
}

async function inlineHomeStylesheet(
  headHtml: string,
  routePath: string,
): Promise<string> {
  if (!HOME_ROUTE_PATHS.has(routePath)) {
    return headHtml;
  }

  const css = await getHomeStylesheetCss();
  if (!css) return headHtml;

  const withoutHomeLinks = headHtml
    .replace(
      /<link\b[^>]*href=["']\/assets\/Home-[^"']+\.css["'][^>]*>\s*/gi,
      "",
    )
    .replace(
      /<link\b[^>]*rel=["']preload["'][^>]*href=["']\/assets\/Home-[^"']+\.css["'][^>]*>\s*/gi,
      "",
    );

  return withoutHomeLinks.replace(
    "</head>",
    `<style id="vez-home-css">${css.replace(/<\//g, "<\\/")}</style>\n</head>`,
  );
}

function stripHomePreconnects(headHtml: string, routePath: string): string {
  if (!HOME_ROUTE_PATHS.has(routePath)) {
    return headHtml;
  }

  return headHtml.replace(
    /<link\b[^>]*rel=["'](?:preconnect|dns-prefetch)["'][^>]*(?:googletagmanager|cloudflare)[^>]*>\s*/gi,
    "",
  );
}

function injectBootSettingsScript(
  headHtml: string,
  bootSettingsJson: string | null,
): string {
  if (!bootSettingsJson) return headHtml;

  const scriptTag = `<script id="vez-boot-settings" type="application/json">${bootSettingsJson.replace(/<\//g, "<\\/")}</script>`;
  return headHtml.replace("</head>", `${scriptTag}\n</head>`);
}

function injectHeroVideoPreload(headHtml: string, routePath: string): string {
  if (!HOME_ROUTE_PATHS.has(routePath)) {
    return headHtml;
  }

  const tags = [
    `<link rel="preload" href="/hero-bg.mp4" as="fetch" type="video/mp4" crossorigin>`,
  ].join("\n    ");

  return headHtml.replace("</head>", `${tags}\n</head>`);
}

function sanitizePrerenderVideo(
  openTag: string,
  rest: string,
  kind: "hero" | "footer",
): string {
  let tag = openTag.replace(/\sposter="[^"]*"/gi, "");
  tag = tag.replace(/\spreload="[^"]*"/gi, "");
  tag = tag.replace(/\sautoplay(="[^"]*")?/gi, "");

  if (!/\bmuted\b/i.test(tag)) {
    tag += " muted";
  }
  if (!/\bplaysinline\b/i.test(tag)) {
    tag += " playsinline";
  }

  if (kind === "hero") {
    return `${tag} autoplay preload="metadata"${rest}`;
  }

  return `${tag} preload="none"${rest}`;
}

function optimizeHomePrerenderBody(
  bodyHtml: string,
  routePath: string,
): string {
  if (!HOME_ROUTE_PATHS.has(routePath)) {
    return bodyHtml;
  }

  return bodyHtml
    .replace(
      /(<video\b(?=[^>]*(?:videoBg|_videoBg_))[^>]*)(>[\s\S]*?<\/video>)/gi,
      (_match, openTag: string, rest: string) =>
        sanitizePrerenderVideo(openTag, rest, "hero"),
    )
    .replace(
      /(<video\b(?=[^>]*(?:footerVideo|_footerVideo_))[^>]*)(>[\s\S]*?<\/video>)/gi,
      (_match, openTag: string, rest: string) =>
        sanitizePrerenderVideo(openTag, rest, "footer"),
    );
}

async function prerenderRoute({
  page,
  diagnostics,
  routePath,
  port,
}: PrerenderRouteInput): Promise<PrerenderResult> {
  const url = `http://127.0.0.1:${port}${routePath}`;

  try {
    await page.goto(url, {
      timeout: NAV_TIMEOUT,
      waitUntil: "domcontentloaded",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, routePath, reason: `navigation failed: ${message}` };
  }

  try {
    await page.waitForFunction(SEO_READY_PREDICATE, undefined, {
      timeout: SEO_READY_TIMEOUT,
    });
    await page
      .waitForFunction(
        () => window.localStorage.getItem("vez-public-settings-v1") !== null,
        undefined,
        { timeout: SEO_READY_TIMEOUT },
      )
      .catch(() => undefined);

    // Subsequent routes inherit localStorage settings from the previous route,
    // so the settings predicate returns immediately and the body is captured
    // before React.lazy chunks resolve. Wait for network idle + real content.
    await page
      .waitForLoadState("networkidle", { timeout: SEO_READY_TIMEOUT })
      .catch(() => undefined);
    await page
      .waitForFunction(
        () =>
          (document.body.innerText || "").replace(/\s+/g, " ").trim().length >
          600,
        undefined,
        { timeout: 8_000 },
      )
      .catch(() => undefined);
  } catch (error) {
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    const validationErrors = validateSeoRouteHtml(routePath, html);
    const snapshot = await getSeoDebugSnapshot(page);
    const pageMessages = diagnostics.messages();
    const message =
      error instanceof Error ? error.message.split("\n")[0] : String(error);
    const diagnosticSuffix = [
      `snapshot: ${snapshot}`,
      pageMessages.length > 0
        ? `events: ${pageMessages.join(" | ")}`
        : "events: none",
    ].join("; ");
    const reason =
      validationErrors.length > 0
        ? `SEO not ready: ${validationErrors.join("; ")}; ${diagnosticSuffix}`
        : `SEO readiness timed out: ${message}; ${diagnosticSuffix}`;
    return { ok: false, routePath, reason };
  }

  const headHtml: string = await page.evaluate(() => document.head.outerHTML);
  const htmlLang: string = await page.evaluate(
    () => document.documentElement.lang || "pl",
  );
  const bodyHtml: string = await page.evaluate(() => document.body.outerHTML);
  const bootSettingsJson: string | null = await page.evaluate(() => {
    return window.localStorage.getItem("vez-public-settings-v1");
  });
  const fullHtml: string = await page.evaluate(
    () => document.documentElement.outerHTML,
  );
  const normalizedHtml = fullHtml.split(PREVIEW_ORIGIN).join(SITE_ORIGIN);
  const validationErrors = validateSeoRouteHtml(routePath, normalizedHtml);

  if (validationErrors.length > 0) {
    return {
      ok: false,
      routePath,
      reason: `SEO validation failed: ${validationErrors.join("; ")}`,
    };
  }

  const normalizedHead = injectBootSettingsScript(
    injectHeroVideoPreload(
      await inlineHomeStylesheet(
        stripHomePreconnects(
          removeNonCriticalHomeAssetHints(
            headHtml.split(PREVIEW_ORIGIN).join(SITE_ORIGIN),
            routePath,
          ),
          routePath,
        ),
        routePath,
      ),
      routePath,
    ),
    bootSettingsJson,
  );
  const normalizedBody = optimizeHomePrerenderBody(
    bodyHtml.split(PREVIEW_ORIGIN).join(SITE_ORIGIN),
    routePath,
  );
  const prerendered = buildPrerenderedHtml(
    normalizedHead,
    htmlLang,
    normalizedBody,
  );

  const outDir = join(DIST_DIR, routePath.slice(1));
  const outPath = join(outDir, "index.html");

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, prerendered, "utf-8");

  return { ok: true, routePath };
}

async function main() {
  const skipPrerender = process.env.SKIP_PRERENDER === "1";
  const apiUrl = process.env.VITE_API_URL?.trim() ?? "";

  if (skipPrerender) {
    console.log("Skipping prerendering — SKIP_PRERENDER=1");
    process.exit(0);
  }

  if (SKIP_URLS.includes(apiUrl)) {
    console.error(
      "Prerendering requires a real VITE_API_URL; refusing to ship an unprerendered SEO build",
    );
    process.exit(1);
  }

  const template = await readFile(join(DIST_DIR, "index.html"), "utf-8");

  if (!template.includes('<div id="root"')) {
    console.error(
      "dist/index.html is missing or invalid — run vite build first",
    );
    process.exit(1);
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
    console.error(
      "vite preview server did not start — cannot prerender SEO HTML",
    );
    await stopPreviewServer(previewProcess);
    process.exit(1);
  }

  console.log("Preview server ready");

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    const message = error instanceof Error ? ` ${error.message}` : "";
    console.error(
      `Chromium not available — cannot prerender SEO HTML.${message} Run: npx playwright install chromium`,
    );
    await stopPreviewServer(previewProcess);
    process.exit(1);
  }

  const page = await browser.newPage();
  await page.addInitScript(() => {
    window.__VEZ_PRERENDER__ = true;
  });
  const diagnostics = attachPageDiagnostics(page);
  let successCount = 0;
  let skipCount = 0;
  const failures: PrerenderResult[] = [];

  for (const routePath of allPaths) {
    const result = await prerenderRoute({
      page,
      diagnostics,
      routePath,
      port: PREVIEW_PORT,
    });
    if (result.ok) {
      successCount++;
      console.log(`  done: ${routePath}`);
    } else {
      skipCount++;
      failures.push(result);
      console.warn(
        `  failed: ${routePath} (${result.reason ?? "unknown error"})`,
      );
    }
  }

  await page.close();
  await browser.close();
  await stopPreviewServer(previewProcess);

  console.log(
    `\nPrerendered ${successCount}/${allPaths.length} routes (${skipCount} skipped)`,
  );

  if (failures.length > 0) {
    console.error("\nPrerendering failed for required routes:");
    for (const failure of failures) {
      console.error(
        `- ${failure.routePath}: ${failure.reason ?? "unknown error"}`,
      );
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(
    "Prerendering failed:",
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
