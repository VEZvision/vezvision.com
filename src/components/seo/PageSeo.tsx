import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

import { useLanguageContext } from "@/hooks/useLanguage";
import { useSettings } from "@/hooks/useSettings";
import { SUPPORTED_LOCALES } from "@/routing/routes.config";
import { localizedPath, stripLocaleFromPathname } from "@/routing/locale";
import {
  joinUrlPath,
  safeAbsoluteHttpUrl,
  safeImageUrl,
} from "@/utils/safeHref";
import { getSafeStructuredDataJson, safeJsonLd } from "@/utils/safeJsonLd";
import { getLocalizedLabel } from "@/utils/i18n";

const SITE_URL_FALLBACK =
  import.meta.env.VITE_SITE_URL || "https://vezvision.com";

function getRobots(indexable: boolean, robots: string, fallback: string) {
  if (!indexable) return "noindex,nofollow";
  return robots || fallback;
}

/**
 * Hardcoded noindex for pages that should never be indexed regardless of CMS state.
 * `vv_page_seo` is empty by default — these pages would fall through to SEO.tsx
 * fallback (`index,follow`) which is wrong.
 */
const NOINDEX_ROBOTS: Record<string, string> = {
  "not-found": "noindex,follow",
  unsubscribe: "noindex,nofollow",
};

type SeoTranslationField = "title" | "description";

function getTranslatedSeoFallback(
  translate: (key: string) => string,
  pageKey: string,
  field: SeoTranslationField,
): string {
  const translationKey = `seo.${pageKey}.${field}`;
  const value = translate(translationKey).trim();
  return value === translationKey ? "" : value;
}

interface PageSeoProps {
  pageKey: string;
}

const PageSeo = ({ pageKey }: PageSeoProps) => {
  const { language, t } = useLanguageContext();
  const { pageSeo, seo, identity } = useSettings();
  const location = useLocation();

  const entry = pageSeo?.[pageKey];
  const forcedRobots = NOINDEX_ROBOTS[pageKey];
  const fallbackTitle = getTranslatedSeoFallback(t, pageKey, "title");
  const fallbackDescription = getTranslatedSeoFallback(
    t,
    pageKey,
    "description",
  );

  const siteUrl = safeAbsoluteHttpUrl(seo?.siteUrl) || SITE_URL_FALLBACK;
  const canonicalUrl =
    safeAbsoluteHttpUrl(entry?.canonical_url) ||
    (siteUrl
      ? joinUrlPath(
          siteUrl,
          localizedPath(
            language,
            stripLocaleFromPathname(location.pathname).replace(/^\//, ""),
          ),
        )
      : "");
  const title = entry
    ? getLocalizedLabel(language, entry.title_pl, entry.title_en) ||
      fallbackTitle
    : fallbackTitle;
  const description = entry
    ? getLocalizedLabel(language, entry.description_pl, entry.description_en) ||
      fallbackDescription
    : fallbackDescription;
  const ogTitle =
    (entry
      ? getLocalizedLabel(language, entry.og_title_pl, entry.og_title_en)
      : "") || title;
  const ogDescription =
    (entry
      ? getLocalizedLabel(
          language,
          entry.og_description_pl,
          entry.og_description_en,
        )
      : "") || description;
  const robots =
    forcedRobots ??
    (entry
      ? getRobots(entry.indexable, entry.robots, seo?.robots || "index,follow")
      : seo?.robots || "index,follow");
  const ogImage =
    safeImageUrl(entry?.og_image_url) ||
    safeImageUrl(identity?.defaultOgImageUrl) ||
    safeImageUrl(identity?.logoUrl) ||
    (siteUrl ? joinUrlPath(siteUrl, "/og-image.png") : "");
  const ogSiteName =
    seo?.ogSiteName || identity?.siteName || seo?.siteTitle || "";
  const structuredDataJson = entry
    ? getSafeStructuredDataJson(entry.structured_data_json)
    : null;

  if (!entry && !forcedRobots && !title && !description) {
    return null;
  }

  const pathWithoutLocale = stripLocaleFromPathname(location.pathname);
  const alternatePathSuffix =
    pathWithoutLocale === "/" ? "" : pathWithoutLocale.replace(/^\//, "");
  const hreflangUrls = siteUrl
    ? SUPPORTED_LOCALES.map((locale) => ({
        locale,
        url: joinUrlPath(siteUrl, localizedPath(locale, alternatePathSuffix)),
      }))
    : [];
  const xDefaultUrl = hreflangUrls.find((item) => item.locale === "en")?.url;

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonicalUrl ? `${canonicalUrl}#webpage` : undefined,
    url: canonicalUrl || undefined,
    name: title || undefined,
    description: description || undefined,
    inLanguage: language === "pl" ? "pl-PL" : "en-US",
    isPartOf: siteUrl
      ? { "@id": joinUrlPath(siteUrl, "/#website") }
      : undefined,
    publisher: siteUrl
      ? { "@id": joinUrlPath(siteUrl, "/#organization") }
      : undefined,
  };

  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      {hreflangUrls.map(({ locale, url }) => (
        <link key={locale} rel="alternate" hrefLang={locale} href={url} />
      ))}
      {xDefaultUrl ? (
        <link rel="alternate" hrefLang="x-default" href={xDefaultUrl} />
      ) : null}
      <meta name="robots" content={robots} />
      {ogTitle ? <meta property="og:title" content={ogTitle} /> : null}
      {ogDescription ? (
        <meta property="og:description" content={ogDescription} />
      ) : null}
      <meta property="og:type" content="website" />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {ogImage ? <meta property="og:image:width" content="1200" /> : null}
      {ogImage ? <meta property="og:image:height" content="630" /> : null}
      {ogImage ? (
        <meta property="og:image:alt" content={ogTitle || "VezVision"} />
      ) : null}
      {ogSiteName ? (
        <meta property="og:site_name" content={ogSiteName} />
      ) : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vezvision" />
      <meta name="twitter:creator" content="@vezvision" />
      {ogTitle ? <meta name="twitter:title" content={ogTitle} /> : null}
      {ogDescription ? (
        <meta name="twitter:description" content={ogDescription} />
      ) : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {canonicalUrl ? (
        <script type="application/ld+json">{safeJsonLd(webPageSchema)}</script>
      ) : null}
      {structuredDataJson ? (
        <script type="application/ld+json">{structuredDataJson}</script>
      ) : null}
    </Helmet>
  );
};

export default PageSeo;
