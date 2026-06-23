import { APP_ROUTES, SUPPORTED_LOCALES } from "@/routing/routes.config";

const GENERIC_TITLES = new Set(["", "VezVision"]);
const REQUIRED_HREFLANGS = ["pl", "en", "x-default"] as const;

type HtmlAttributeMap = Readonly<Record<string, string>>;

function normalizeRoutePath(routePath: string): string {
  const pathOnly = routePath.split(/[?#]/, 1)[0] ?? "/";
  const withSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
}

function normalizeUrlPath(value: string): string {
  try {
    return normalizeRoutePath(new URL(value).pathname);
  } catch (error) {
    if (error instanceof TypeError) return "";
    throw error;
  }
}

function isSupportedLocaleValue(
  value: string | undefined,
): value is (typeof SUPPORTED_LOCALES)[number] {
  return value === "pl" || value === "en";
}

function getRouteLocale(routePath: string): string | undefined {
  return normalizeRoutePath(routePath).split("/").filter(Boolean)[0];
}

function readUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
}

function sameOrigin(value: string, origin: string): URL | null {
  const url = readUrl(value);
  if (!url || url.origin !== origin) {
    return null;
  }

  return url;
}

function parseAttributes(tag: string): HtmlAttributeMap {
  const entries = Array.from(
    tag.matchAll(/\s([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g),
  ).map((match) => {
    const [, name, , doubleQuotedValue, singleQuotedValue] = match;
    return [
      name.toLowerCase(),
      doubleQuotedValue ?? singleQuotedValue ?? "",
    ] as const;
  });

  return Object.fromEntries(entries);
}

function findTags(html: string, tagName: string): readonly HtmlAttributeMap[] {
  const tagPattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  return Array.from(html.matchAll(tagPattern)).map((match) =>
    parseAttributes(match[0]),
  );
}

function findTagByAttribute(
  html: string,
  tagName: string,
  attributeName: string,
  attributeValue: string,
): HtmlAttributeMap | undefined {
  const normalizedName = attributeName.toLowerCase();
  const normalizedValue = attributeValue.toLowerCase();
  return findTags(html, tagName).find(
    (attributes) =>
      attributes[normalizedName]?.toLowerCase() === normalizedValue,
  );
}

function extractTitle(html: string): string {
  return extractTitles(html)[0] ?? "";
}

function extractTitles(html: string): readonly string[] {
  return Array.from(html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)).map(
    (match) => match[1]?.replace(/\s+/g, " ").trim() ?? "",
  );
}

function hasJsonLd(html: string): boolean {
  return /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i.test(
    html,
  );
}

function hasLocalizedLang(routePath: string, html: string): boolean {
  const locale = getRouteLocale(routePath);
  if (!isSupportedLocaleValue(locale)) {
    return true;
  }

  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const lang = parseAttributes(htmlTag).lang?.toLowerCase() ?? "";
  return lang === locale || lang.startsWith(`${locale}-`);
}

function hasCanonicalForRoute(routePath: string, html: string): boolean {
  const canonical =
    findTagByAttribute(html, "link", "rel", "canonical")?.href ?? "";
  return normalizeUrlPath(canonical) === normalizeRoutePath(routePath);
}

function hasHrefLang(html: string, hreflang: string): boolean {
  return findTags(html, "link").some((attributes) => {
    const rel = attributes.rel?.toLowerCase() ?? "";
    const value = attributes.hreflang?.toLowerCase() ?? "";
    return rel === "alternate" && value === hreflang;
  });
}

function hasContentMeta(
  html: string,
  attributeName: "name" | "property",
  attributeValue: string,
): boolean {
  const tag = findTagByAttribute(html, "meta", attributeName, attributeValue);
  return Boolean(tag?.content?.trim());
}

function findContentMetaValues(
  html: string,
  attributeName: "name" | "property",
  attributeValue: string,
): readonly string[] {
  const normalizedName = attributeName.toLowerCase();
  const normalizedValue = attributeValue.toLowerCase();

  return findTags(html, "meta").flatMap((attributes) => {
    if (attributes[normalizedName]?.toLowerCase() !== normalizedValue) {
      return [];
    }

    const content = attributes.content?.trim() ?? "";
    return content ? [content] : [];
  });
}

export function getRequiredStaticSeoPaths(): readonly string[] {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    APP_ROUTES.flatMap((route) => {
      if (route.pageKey === "not-found" || route.pageKey === "unsubscribe") {
        return [];
      }
      if (route.dynamic) return [];

      const suffix = route.path === "" ? "" : `/${route.path}`;
      return [`/${locale}${suffix}`];
    }),
  );
}

export function routePathToDistIndex(routePath: string): string {
  const normalized = normalizeRoutePath(routePath);
  const withoutLeadingSlash = normalized.replace(/^\/+/, "");
  return withoutLeadingSlash
    ? `${withoutLeadingSlash}/index.html`
    : "index.html";
}

export function validateSeoRouteHtml(
  routePath: string,
  html: string,
): readonly string[] {
  const errors: string[] = [];
  const titles = extractTitles(html);
  const title = extractTitle(html);
  const descriptions = findContentMetaValues(html, "name", "description");

  if (!hasLocalizedLang(routePath, html)) {
    errors.push("html lang does not match route locale");
  }

  if (titles.length !== 1) {
    errors.push("must contain exactly one title tag");
  }

  if (GENERIC_TITLES.has(title)) {
    errors.push("missing unique title");
  }

  if (descriptions.length !== 1) {
    errors.push("must contain exactly one meta description");
  }

  if (!hasContentMeta(html, "name", "description")) {
    errors.push("missing meta description");
  }

  if (!hasCanonicalForRoute(routePath, html)) {
    errors.push("missing canonical link for route");
  }

  if (!hasContentMeta(html, "name", "robots")) {
    errors.push("missing robots meta");
  }

  if (!hasContentMeta(html, "property", "og:title")) {
    errors.push("missing Open Graph title");
  }

  if (!hasContentMeta(html, "property", "og:description")) {
    errors.push("missing Open Graph description");
  }

  if (!hasContentMeta(html, "property", "og:url")) {
    errors.push("missing Open Graph URL");
  }

  if (!hasContentMeta(html, "name", "twitter:title")) {
    errors.push("missing Twitter title");
  }

  if (!hasContentMeta(html, "name", "twitter:description")) {
    errors.push("missing Twitter description");
  }

  for (const hreflang of REQUIRED_HREFLANGS) {
    if (!hasHrefLang(html, hreflang)) {
      errors.push(`missing hreflang ${hreflang}`);
    }
  }

  if (!hasJsonLd(html)) {
    errors.push("missing JSON-LD structured data");
  }

  return errors;
}

export function extractSitemapRoutePaths(
  sitemapXml: string,
  siteOrigin: string,
): readonly string[] {
  const origin = siteOrigin.replace(/\/+$/, "");
  const paths = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)).flatMap(
    (match) => {
      const url = sameOrigin(match[1] ?? "", origin);
      if (!url) return [];

      const routePath = normalizeRoutePath(url.pathname);
      const locale = getRouteLocale(routePath);
      return isSupportedLocaleValue(locale) ? [routePath] : [];
    },
  );

  return Array.from(new Set(paths));
}
