/* eslint-disable @typescript-eslint/no-floating-promises -- node:test describe/it return promises by design */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

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
});
