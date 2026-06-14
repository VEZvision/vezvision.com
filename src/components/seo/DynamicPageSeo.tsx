import { Helmet } from 'react-helmet-async';

import { SUPPORTED_LOCALES } from '@/routing/routes.config';
import { safeImageUrl } from '@/utils/safeHref';
import { safeJsonLd } from '@/utils/safeJsonLd';

export type DynamicOgType = 'article' | 'website';
export type DynamicLocale = 'pl' | 'en';

interface DynamicPageSeoProps {
  title: string;
  description?: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType?: DynamicOgType;
  robots?: string;
  language: DynamicLocale;
  structuredData?: Record<string, unknown>;
  siteUrl?: string;
  localizedPathSuffix?: string;
  /** Locales that have real content — omit hreflang for missing translations. */
  availableLocales?: DynamicLocale[];
}

function buildAlternateUrl(siteUrl: string, locale: DynamicLocale, pathSuffix: string): string {
  const base = siteUrl.replace(/\/$/, '');
  const suffix = pathSuffix.replace(/^\//, '');
  return suffix ? `${base}/${locale}/${suffix}` : `${base}/${locale}`;
}

export default function DynamicPageSeo({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'article',
  robots = 'index,follow',
  language,
  structuredData,
  siteUrl,
  localizedPathSuffix,
  availableLocales,
}: DynamicPageSeoProps) {
  const ogLocale = language === 'pl' ? 'pl_PL' : 'en_US';
  const structuredDataJson = structuredData ? safeJsonLd(structuredData) : null;
  const safeOgImage = ogImage ? (safeImageUrl(ogImage) ?? undefined) : undefined;

  const webPageSchema = canonicalUrl
    ? safeJsonLd({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description: description || undefined,
        inLanguage: language === 'pl' ? 'pl-PL' : 'en-US',
        isPartOf: siteUrl ? { '@id': `${siteUrl}/#website` } : undefined,
        publisher: siteUrl ? { '@id': `${siteUrl}/#organization` } : undefined,
      })
    : null;
  const pathSuffix = localizedPathSuffix?.replace(/^\//, '') ?? '';
  const hreflangLocales =
    availableLocales && availableLocales.length > 0
      ? availableLocales
      : siteUrl && pathSuffix
        ? [...SUPPORTED_LOCALES]
        : [];

  const ogLocaleAlternates = hreflangLocales
    .filter((locale) => locale !== language)
    .map((locale) => (locale === 'pl' ? 'pl_PL' : 'en_US'));

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
      {siteUrl && pathSuffix && hreflangLocales.includes('pl') ? (
        <link rel="alternate" hrefLang="x-default" href={buildAlternateUrl(siteUrl, 'pl', pathSuffix)} />
      ) : null}
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      {safeOgImage ? <meta property="og:image" content={safeOgImage} /> : null}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content={ogLocale} />
      {ogLocaleAlternates.map((alternate) => (
        <meta key={alternate} property="og:locale:alternate" content={alternate} />
      ))}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description ? <meta name="twitter:description" content={description} /> : null}
      {safeOgImage ? <meta name="twitter:image" content={safeOgImage} /> : null}
      {webPageSchema ? (
        <script type="application/ld+json">{webPageSchema}</script>
      ) : null}
      {structuredDataJson ? (
        <script type="application/ld+json">{structuredDataJson}</script>
      ) : null}
    </Helmet>
  );
}
