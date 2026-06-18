import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

import { useLanguageContext } from "@/hooks/useLanguage";
import { useSettings } from "@/hooks/useSettings";
import { SUPPORTED_LOCALES } from "@/routing/routes.config";
import { localizedPath, stripLocaleFromPathname } from "@/routing/locale";
import { safeAbsoluteHttpUrl, safeImageUrl } from "@/utils/safeHref";
import { getSafeStructuredDataJson, safeJsonLd } from "@/utils/safeJsonLd";

function getLocalizedValue(
  language: "pl" | "en",
  plValue: string,
  enValue: string,
) {
  return language === "en" ? enValue || plValue : plValue;
}

function getRobots(indexable: boolean, robots: string, fallback: string) {
  if (!indexable) return "noindex,nofollow";
  return robots || fallback;
}

interface PageSeoProps {
  pageKey: string;
}

const PageSeo = ({ pageKey }: PageSeoProps) => {
  const { language } = useLanguageContext();
  const { pageSeo, seo, identity } = useSettings();
  const location = useLocation();

  const entry = pageSeo?.[pageKey];
  if (!entry) return null;

  const siteUrl =
    safeAbsoluteHttpUrl(seo?.siteUrl) ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const canonicalUrl =
    safeAbsoluteHttpUrl(entry.canonical_url) ||
    (siteUrl
      ? `${siteUrl}${location.pathname === "/" ? "" : location.pathname}`
      : "");
  const title = getLocalizedValue(language, entry.title_pl, entry.title_en);
  const description = getLocalizedValue(
    language,
    entry.description_pl,
    entry.description_en,
  );
  const ogTitle =
    getLocalizedValue(language, entry.og_title_pl, entry.og_title_en) || title;
  const ogDescription =
    getLocalizedValue(
      language,
      entry.og_description_pl,
      entry.og_description_en,
    ) || description;
  const robots = getRobots(
    entry.indexable,
    entry.robots,
    seo?.robots || "index,follow",
  );
  const ogImage =
    safeImageUrl(entry.og_image_url) ||
    safeImageUrl(identity?.defaultOgImageUrl) ||
    safeImageUrl(identity?.logoUrl) ||
    "";
  const ogSiteName =
    seo?.ogSiteName || identity?.siteName || seo?.siteTitle || "";
  const structuredDataJson = getSafeStructuredDataJson(
    entry.structured_data_json,
  );

  const pathWithoutLocale = stripLocaleFromPathname(location.pathname);
  const alternatePathSuffix =
    pathWithoutLocale === "/" ? "" : pathWithoutLocale.replace(/^\//, "");
  const hreflangUrls = siteUrl
    ? SUPPORTED_LOCALES.map((locale) => ({
        locale,
        url: `${siteUrl}${localizedPath(locale, alternatePathSuffix)}`,
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
    isPartOf: siteUrl ? { "@id": `${siteUrl}/#website` } : undefined,
    publisher: siteUrl ? { "@id": `${siteUrl}/#organization` } : undefined,
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
      {ogSiteName ? (
        <meta property="og:site_name" content={ogSiteName} />
      ) : null}
      <meta name="twitter:card" content="summary_large_image" />
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
