import { Helmet } from "react-helmet-async";

import { SUPPORTED_LOCALES } from "@/routing/routes.config";
import { safeImageUrl } from "@/utils/safeHref";
import { safeJsonLd } from "@/utils/safeJsonLd";

export type DynamicOgType = "article" | "website";
export type DynamicLocale = "pl" | "en";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface DynamicPageSeoProps {
  title: string;
  description?: string | undefined;
  canonicalUrl: string;
  ogImage?: string | undefined;
  ogType?: DynamicOgType;
  robots?: string;
  language: DynamicLocale;
  structuredData?: Record<string, unknown>;
  siteUrl?: string | undefined;
  localizedPathSuffix?: string | undefined;
  availableLocales?: DynamicLocale[];
  breadcrumbItems?: BreadcrumbItem[];
  articlePublishedTime?: string | undefined;
  articleModifiedTime?: string | undefined;
  articleAuthor?: string | undefined;
  articleSection?: string | undefined;
  articleTags?: string[] | undefined;
}

function buildAlternateUrl(
  siteUrl: string,
  locale: DynamicLocale,
  pathSuffix: string,
): string {
  const base = siteUrl.replace(/\/$/, "");
  const suffix = pathSuffix.replace(/^\//, "");
  return suffix ? `${base}/${locale}/${suffix}` : `${base}/${locale}`;
}

export default function DynamicPageSeo({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = "article",
  robots = "index,follow",
  language,
  structuredData,
  siteUrl,
  localizedPathSuffix,
  availableLocales,
  breadcrumbItems,
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  articleSection,
  articleTags,
}: DynamicPageSeoProps) {
  const ogLocale = language === "pl" ? "pl_PL" : "en_US";
  const structuredDataJson = structuredData ? safeJsonLd(structuredData) : null;
  const safeOgImage = ogImage
    ? (safeImageUrl(ogImage) ?? undefined)
    : undefined;

  const webPageSchema = canonicalUrl
    ? safeJsonLd({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description: description || undefined,
        inLanguage: language === "pl" ? "pl-PL" : "en-US",
        isPartOf: siteUrl ? { "@id": `${siteUrl}/#website` } : undefined,
        publisher: siteUrl ? { "@id": `${siteUrl}/#organization` } : undefined,
      })
    : null;
  const pathSuffix = localizedPathSuffix?.replace(/^\//, "") ?? "";
  const hreflangLocales =
    availableLocales && availableLocales.length > 0
      ? availableLocales
      : siteUrl && pathSuffix
        ? [...SUPPORTED_LOCALES]
        : [];

  const ogLocaleAlternates = hreflangLocales
    .filter((locale) => locale !== language)
    .map((locale) => (locale === "pl" ? "pl_PL" : "en_US"));

  const breadcrumbListSchema =
    siteUrl && breadcrumbItems && breadcrumbItems.length > 0
      ? safeJsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: language === "pl" ? "Strona główna" : "Home",
              item: siteUrl,
            },
            ...breadcrumbItems.map((item, index) => ({
              "@type": "ListItem",
              position: index + 2,
              name: item.name,
              item: `${siteUrl}/${language}/${item.path.replace(/^\//, "")}`,
            })),
          ],
        })
      : null;

  return (
    <Helmet>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      {siteUrl && pathSuffix
        ? hreflangLocales.map((locale) => (
            <link
              key={locale}
              rel="alternate"
              hrefLang={locale}
              href={buildAlternateUrl(siteUrl, locale, pathSuffix)}
            />
          ))
        : null}
      {siteUrl && pathSuffix && hreflangLocales.includes("en") ? (
        <link
          rel="alternate"
          hrefLang="x-default"
          href={buildAlternateUrl(siteUrl, "en", pathSuffix)}
        />
      ) : null}
      <meta property="og:title" content={title} />
      {description ? (
        <meta property="og:description" content={description} />
      ) : null}
      {safeOgImage ? <meta property="og:image" content={safeOgImage} /> : null}
      {safeOgImage ? <meta property="og:image:width" content="1200" /> : null}
      {safeOgImage ? <meta property="og:image:height" content="630" /> : null}
      {safeOgImage ? <meta property="og:image:alt" content={title} /> : null}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      {ogType === "article" && articlePublishedTime ? (
        <meta
          property="article:published_time"
          content={articlePublishedTime}
        />
      ) : null}
      {ogType === "article" && articleModifiedTime ? (
        <meta property="article:modified_time" content={articleModifiedTime} />
      ) : null}
      {ogType === "article" && articleAuthor ? (
        <meta property="article:author" content={articleAuthor} />
      ) : null}
      {ogType === "article" && articleSection ? (
        <meta property="article:section" content={articleSection} />
      ) : null}
      {ogType === "article" && articleTags
        ? articleTags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))
        : null}
      <meta property="og:locale" content={ogLocale} />
      {ogLocaleAlternates.map((alternate) => (
        <meta
          key={alternate}
          property="og:locale:alternate"
          content={alternate}
        />
      ))}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description ? (
        <meta name="twitter:description" content={description} />
      ) : null}
      {safeOgImage ? <meta name="twitter:image" content={safeOgImage} /> : null}
      {webPageSchema ? (
        <script type="application/ld+json">{webPageSchema}</script>
      ) : null}
      {breadcrumbListSchema ? (
        <script type="application/ld+json">{breadcrumbListSchema}</script>
      ) : null}
      {structuredDataJson ? (
        <script type="application/ld+json">{structuredDataJson}</script>
      ) : null}
    </Helmet>
  );
}
