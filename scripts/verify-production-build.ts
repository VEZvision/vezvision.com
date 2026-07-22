import fs from "node:fs";
import path from "node:path";

import {
  extractSitemapRoutePaths,
  getRequiredStaticSeoPaths,
  routePathToDistIndex,
  validateSeoRouteHtml,
} from "./seo-build-validation";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");
const htaccessPath = path.join(distDir, ".htaccess");
const notFoundPath = path.join(distDir, "404.html");
const assetsDir = path.join(distDir, "assets");
const sitemapPath = path.join(distDir, "sitemap.xml");
const isE2EBuild = process.env.E2E_BUILD === "1";
const isSentryBuild = Boolean(process.env.SENTRY_AUTH_TOKEN);
const skipSeoRouteValidation = process.env.SKIP_PRERENDER === "1";
const siteOrigin = (
  process.env.VITE_SITE_URL || "https://vezvision.com"
).replace(/\/+$/, "");

const errors: string[] = [];

function readTextFile(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

function addRootIndexErrors(indexHtml: string): void {
  if (indexHtml.includes("%LANG%")) {
    errors.push("dist/index.html still contains unresolved %LANG% placeholder");
  }

  if (!/<html[^>]*\slang="[a-z]{2}"/i.test(indexHtml)) {
    errors.push("dist/index.html must declare a valid html lang attribute");
  }

  if (indexHtml.includes("__e2e__/error")) {
    errors.push("production build must not include E2E probe routes");
  }
}

function addHtaccessErrors(htaccess: string): void {
  if (!htaccess.includes("RewriteRule . /index.html")) {
    errors.push("dist/.htaccess is missing SPA fallback rewrite");
  }
  if (
    !htaccess.includes("Content-Security-Policy") ||
    !htaccess.includes("frame-ancestors 'none'")
  ) {
    errors.push("dist/.htaccess must include CSP frame-ancestors defense");
  }
  if (
    !htaccess.includes("Require all denied") ||
    !htaccess.includes("\\.map$")
  ) {
    errors.push("dist/.htaccess must deny public source map access");
  }
}

function addAssetErrors(): void {
  if (!fs.existsSync(assetsDir)) return;

  const assetNames = fs.readdirSync(assetsDir);
  const sourceMaps = assetNames.filter((name) => name.endsWith(".map"));
  if (!isSentryBuild && sourceMaps.length > 0) {
    errors.push(
      `dist/assets must not include public source maps (${sourceMaps.length} found)`,
    );
  }

  if (!isE2EBuild) {
    const e2eAssets = assetNames.filter((name) =>
      /E2eErrorTrigger|__e2e__/i.test(name),
    );
    if (e2eAssets.length > 0) {
      errors.push(
        `production build must not include E2E probe assets: ${e2eAssets.join(", ")}`,
      );
    }
  }
}

function addSeoRouteErrors(routePath: string): void {
  const relativeIndexPath = routePathToDistIndex(routePath);
  const indexFilePath = path.join(distDir, relativeIndexPath);
  const html = readTextFile(indexFilePath);

  if (!html) {
    errors.push(
      `dist/${relativeIndexPath} is missing for sitemap route ${routePath}`,
    );
    return;
  }

  for (const error of validateSeoRouteHtml(routePath, html)) {
    errors.push(`dist/${relativeIndexPath}: ${error}`);
  }
}

const indexHtml = readTextFile(indexPath);
if (!indexHtml) {
  errors.push("dist/index.html is missing — run vite build first");
} else {
  addRootIndexErrors(indexHtml);
}

const notFoundHtml = readTextFile(notFoundPath);
if (!notFoundHtml) {
  errors.push(
    "dist/404.html is missing — production cannot return a true custom 404",
  );
} else if (
  !skipSeoRouteValidation &&
  !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(
    notFoundHtml,
  )
) {
  errors.push("dist/404.html must include noindex robots metadata");
}

const htaccess = readTextFile(htaccessPath);
if (!htaccess) {
  errors.push(
    "dist/.htaccess is missing - static-host SPA routing will not work",
  );
} else {
  addHtaccessErrors(htaccess);
}

addAssetErrors();

if (skipSeoRouteValidation) {
  console.log("Skipping SEO route validation — SKIP_PRERENDER=1");
} else {
  const seoRoutePaths = new Set(getRequiredStaticSeoPaths());
  const sitemapXml = readTextFile(sitemapPath);
  if (!sitemapXml) {
    errors.push(
      "dist/sitemap.xml is missing — SEO route validation cannot run",
    );
  } else {
    for (const routePath of extractSitemapRoutePaths(sitemapXml, siteOrigin)) {
      seoRoutePaths.add(routePath);
    }
  }

  for (const routePath of Array.from(seoRoutePaths).sort()) {
    addSeoRouteErrors(routePath);
  }
}

if (errors.length > 0) {
  console.error("Production build verification failed:\n");
  for (const message of errors) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log("Production build verification passed.");
