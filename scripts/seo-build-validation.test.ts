/* eslint-disable @typescript-eslint/no-floating-promises -- node:test describe/it return promises by design */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { resolve } from "node:path";

import {
  extractSitemapRoutePaths,
  getRequiredStaticSeoPaths,
  routePathToDistIndex,
  validateSeoRouteHtml,
} from "./seo-build-validation";

const completeHtml = `<!doctype html>
<html lang="pl">
<head>
  <title>Usługi - VEZvision</title>
  <meta name="description" content="Strony WWW i automatyzacje dla firm.">
  <link rel="canonical" href="https://vezvision.com/pl/services">
  <link rel="alternate" hreflang="pl" href="https://vezvision.com/pl/services">
  <link rel="alternate" hreflang="en" href="https://vezvision.com/en/services">
  <link rel="alternate" hreflang="x-default" href="https://vezvision.com/en/services">
  <meta name="robots" content="index,follow">
  <meta property="og:title" content="Usługi - VEZvision">
  <meta property="og:description" content="Strony WWW i automatyzacje dla firm.">
  <meta property="og:url" content="https://vezvision.com/pl/services">
  <meta name="twitter:title" content="Usługi - VEZvision">
  <meta name="twitter:description" content="Strony WWW i automatyzacje dla firm.">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script>
</head>
<body><main>Usługi</main></body>
</html>`;

describe("SEO build validation", () => {
  it("maps required static routes to crawlable index files", () => {
    const paths = getRequiredStaticSeoPaths();

    assert.ok(paths.includes("/pl"));
    assert.ok(paths.includes("/en/about"));
    assert.ok(!paths.includes("/pl/unsubscribe"));
    assert.ok(!paths.some((path) => path.includes(":")));
    assert.equal(
      routePathToDistIndex("/pl/services"),
      "pl/services/index.html",
    );
  });

  it("accepts prerendered HTML only when SEO-critical tags are present", () => {
    assert.deepEqual(validateSeoRouteHtml("/pl/services", completeHtml), []);
  });

  it("allows localized dynamic content without a second-language hreflang", () => {
    const dynamicHtml = completeHtml
      .replaceAll("/pl/services", "/pl/blog/polski-wpis")
      .replace(
        '<link rel="alternate" hreflang="en" href="https://vezvision.com/en/services">\n  ',
        "",
      )
      .replace(
        "https://vezvision.com/en/services",
        "https://vezvision.com/pl/blog/polski-wpis",
      );

    assert.deepEqual(
      validateSeoRouteHtml("/pl/blog/polski-wpis", dynamicHtml),
      [],
    );
  });

  it("rejects a bare SPA shell for a sitemap route", () => {
    const errors = validateSeoRouteHtml(
      "/pl/services",
      '<!doctype html><html lang="pl"><head><title>VEZvision</title></head><body><div id="root"></div></body></html>',
    );

    assert.ok(errors.some((error) => error.includes("unique title")));
    assert.ok(errors.some((error) => error.includes("meta description")));
    assert.ok(errors.some((error) => error.includes("canonical")));
    assert.ok(errors.some((error) => error.includes("Open Graph title")));
  });

  it("rejects duplicate shell title and description tags before route SEO", () => {
    const errors = validateSeoRouteHtml(
      "/pl/services",
      `<!doctype html>
      <html lang="pl">
      <head>
        <title>VEZvision</title>
        <title>Usługi - VEZvision</title>
        <meta name="description" content="VEZvision — modern AI & automation solutions for business.">
        <meta name="description" content="Strony WWW i automatyzacje dla firm.">
        <link rel="canonical" href="https://vezvision.com/pl/services">
        <link rel="alternate" hreflang="pl" href="https://vezvision.com/pl/services">
        <link rel="alternate" hreflang="en" href="https://vezvision.com/en/services">
        <link rel="alternate" hreflang="x-default" href="https://vezvision.com/en/services">
        <meta name="robots" content="index,follow">
        <meta property="og:title" content="Usługi - VEZvision">
        <meta property="og:description" content="Strony WWW i automatyzacje dla firm.">
        <meta property="og:url" content="https://vezvision.com/pl/services">
        <meta name="twitter:title" content="Usługi - VEZvision">
        <meta name="twitter:description" content="Strony WWW i automatyzacje dla firm.">
        <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script>
      </head>
      <body><main>Usługi</main></body>
      </html>`,
    );

    assert.ok(errors.some((error) => error.includes("exactly one title")));
    assert.ok(
      errors.some((error) => error.includes("exactly one meta description")),
    );
  });

  it("extracts same-origin localized routes from sitemap XML", () => {
    const sitemap = `<?xml version="1.0"?>
      <urlset>
        <url><loc>https://vezvision.com/pl</loc></url>
        <url><loc>https://vezvision.com/en/blog/post</loc></url>
        <url><loc>https://external.example/pl</loc></url>
      </urlset>`;

    assert.deepEqual(
      extractSitemapRoutePaths(sitemap, "https://vezvision.com"),
      ["/pl", "/en/blog/post"],
    );
  });

  it("keeps generated discovery and policy files in the strict Nginx allowlist", () => {
    const nginxConfig = readFileSync(
      resolve(process.cwd(), "frontend-nginx.conf"),
      "utf8",
    );

    for (const requiredPath of [
      "sitemap\\.xml",
      "robots\\.txt",
      "\\.well-known/security\\.txt",
      "\\.well-known/llm-policies\\.json",
      "(pl|en)/blog/feed\\.xml",
    ]) {
      assert.ok(
        nginxConfig.includes(requiredPath),
        `Nginx allowlist is missing ${requiredPath}`,
      );
    }

    assert.ok(
      nginxConfig.includes("location = /manifest.webmanifest"),
      "Nginx allowlist is missing the web app manifest",
    );
    assert.ok(
      nginxConfig.includes("default_type application/manifest+json"),
      "Nginx must serve the web app manifest with its registered media type",
    );
  });

  it("serves prerendered route documents and keeps prerendering enabled in production", () => {
    const nginxConfig = readFileSync(
      resolve(process.cwd(), "frontend-nginx.conf"),
      "utf8",
    );
    const dockerfile = readFileSync(
      resolve(process.cwd(), "frontend.Dockerfile"),
      "utf8",
    );

    assert.ok(nginxConfig.includes("try_files /$1$2/index.html /index.html"));
    assert.ok(nginxConfig.includes("error_page 404 /pl/404/index.html"));
    assert.ok(nginxConfig.includes("error_page 404 /en/404/index.html"));
    assert.ok(dockerfile.includes("playwright install --with-deps chromium"));
    assert.ok(!dockerfile.includes("ENV SKIP_PRERENDER=1"));
    assert.ok(
      dockerfile.includes('test -n "$VITE_TURNSTILE_SITE_KEY"'),
      "Production images must fail closed when the Turnstile site key is missing",
    );
  });

  it("prioritizes lightweight hero posters before background video", () => {
    const heroSource = readFileSync(
      resolve(process.cwd(), "src/components/common/VideoHeroSection.tsx"),
      "utf8",
    );
    const prerenderSource = readFileSync(
      resolve(process.cwd(), "scripts/prerender-head.ts"),
      "utf8",
    );

    assert.ok(heroSource.includes('rel="preload"'));
    assert.ok(heroSource.includes('fetchPriority="high"'));
    assert.ok(heroSource.includes("poster={videoPosterSrc}"));
    assert.ok(
      heroSource.indexOf('type="video/webm"') <
        heroSource.indexOf('type="video/mp4"'),
      "The smaller WebM source must be preferred when supported",
    );
    assert.ok(existsSync(resolve(process.cwd(), "public/hero-poster.avif")));
    assert.ok(existsSync(resolve(process.cwd(), "public/footer-poster.avif")));
    assert.ok(!prerenderSource.includes('href="/hero-bg.mp4?v=65de2eb"'));
    assert.ok(!prerenderSource.includes('replace(/\\sposter="[^"]*"'));
  });

  it("opts prerendered content out of Cloudflare email rewriting", () => {
    const appShell = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

    const start = appShell.indexOf("<!--email_off-->");
    const root = appShell.indexOf('<div id="root"></div>');
    const end = appShell.indexOf("<!--/email_off-->");

    assert.ok(start >= 0, "Cloudflare email opt-out start marker is missing");
    assert.ok(end > start, "Cloudflare email opt-out end marker is missing");
    assert.ok(
      root > start && root < end,
      "The application root must stay inside the Cloudflare email opt-out block",
    );
  });
});
