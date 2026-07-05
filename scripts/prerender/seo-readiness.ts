import type { Page } from "@playwright/test";

export const SEO_READY_PREDICATE = `(() => {
  const getMetaContent = (selector) =>
    document.querySelector(selector)?.getAttribute("content")?.trim() ?? "";
  const hasHreflang = (value) =>
    Boolean(
      document.querySelector('link[rel="alternate"][hreflang="' + value + '"]'),
    );

  return Boolean(
    document.title.trim() &&
      document.title.trim() !== "VEZvision" &&
      getMetaContent('meta[name="description"]') &&
      document.querySelector('link[rel="canonical"][href]') &&
      getMetaContent('meta[name="robots"]') &&
      getMetaContent('meta[property="og:title"]') &&
      getMetaContent('meta[property="og:description"]') &&
      getMetaContent('meta[property="og:url"]') &&
      getMetaContent('meta[name="twitter:title"]') &&
      getMetaContent('meta[name="twitter:description"]') &&
      hasHreflang("pl") &&
      hasHreflang("en") &&
      hasHreflang("x-default") &&
      document.querySelector('script[type="application/ld+json"]'),
  );
})()`;

export interface PageDiagnostics {
  readonly messages: () => readonly string[];
}

interface SeoDebugSnapshot {
  readonly url: string;
  readonly readyState: string;
  readonly title: string;
  readonly titleCount: number;
  readonly descriptionCount: number;
  readonly canonical: string;
  readonly ogTitle: string;
  readonly rootLength: number;
  readonly bodyText: string;
  readonly scripts: readonly string[];
}

const MAX_PAGE_DIAGNOSTICS = 12;

export function attachPageDiagnostics(page: Page): PageDiagnostics {
  const messages: string[] = [];
  const remember = (message: string) => {
    messages.push(message);
    if (messages.length > MAX_PAGE_DIAGNOSTICS) {
      messages.shift();
    }
  };

  page.on("console", (message) => {
    const type = message.type();
    if (type === "error" || type === "warning") {
      remember(`console:${type}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    remember(`pageerror: ${error.message}`);
  });
  page.on("requestfailed", (request) => {
    remember(
      `requestfailed: ${request.url()} ${request.failure()?.errorText ?? "unknown"}`,
    );
  });

  return { messages: () => messages.slice() };
}

export async function getSeoDebugSnapshot(page: Page): Promise<string> {
  const snapshot: SeoDebugSnapshot = await page.evaluate(() => ({
    url: window.location.href,
    readyState: document.readyState,
    title: document.title,
    titleCount: document.querySelectorAll("title").length,
    descriptionCount: document.querySelectorAll('meta[name="description"]')
      .length,
    canonical:
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") ??
      "",
    ogTitle:
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content") ?? "",
    rootLength: document.querySelector("#root")?.innerHTML.length ?? 0,
    bodyText: document.body.innerText.replace(/\s+/g, " ").trim().slice(0, 180),
    scripts: Array.from(document.scripts)
      .map((script) => script.src || script.type || "inline")
      .slice(0, 8),
  }));

  return [
    `url=${snapshot.url}`,
    `ready=${snapshot.readyState}`,
    `title=${JSON.stringify(snapshot.title)}`,
    `titles=${snapshot.titleCount}`,
    `descriptions=${snapshot.descriptionCount}`,
    `canonical=${snapshot.canonical || "none"}`,
    `ogTitle=${snapshot.ogTitle || "none"}`,
    `rootLength=${snapshot.rootLength}`,
    `body=${JSON.stringify(snapshot.bodyText)}`,
    `scripts=${snapshot.scripts.join(",") || "none"}`,
  ].join(" ");
}
