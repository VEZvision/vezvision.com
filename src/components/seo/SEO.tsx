import { Helmet } from "react-helmet-async";
import { useSettings } from "@/hooks/useSettings";
import { useLocation } from "react-router-dom";
import { useLanguageContext } from "@/hooks/useLanguage";
import {
  joinUrlPath,
  safeAbsoluteHttpUrl,
  safeImageUrl,
} from "@/utils/safeHref";
import {
  getPageKeyFromPath,
  isDynamicContentPath,
  SUPPORTED_LOCALES,
} from "@/routing/routes.config";
import { localizedPath, stripLocaleFromPathname } from "@/routing/locale";

const SITE_URL_FALLBACK =
  import.meta.env.VITE_SITE_URL || "https://vezvision.com";

const SEO = () => {
  const { seo, identity } = useSettings();
  const { language } = useLanguageContext();
  const location = useLocation();

  if (!seo && !identity) return null;

  const pageKey = getPageKeyFromPath(location.pathname);
  const shouldSuppressFallbackSeo = isDynamicContentPath(location.pathname);
  const siteUrl = safeAbsoluteHttpUrl(seo?.siteUrl) || SITE_URL_FALLBACK;
  const pathWithoutLocale = stripLocaleFromPathname(location.pathname);
  const canonicalUrl = siteUrl
    ? joinUrlPath(
        siteUrl,
        localizedPath(
          language,
          pathWithoutLocale === "/" ? "" : pathWithoutLocale.slice(1),
        ),
      )
    : "";
  const ogImage =
    safeImageUrl(identity?.defaultOgImageUrl) ||
    safeImageUrl(identity?.logoUrl) ||
    (siteUrl ? joinUrlPath(siteUrl, "/og-image.png") : "");
  const siteDescription = seo?.siteDescription || undefined;
  const robots =
    seo?.robots ||
    "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1";
  const ogSiteName =
    seo?.ogSiteName || identity?.siteName || seo?.siteTitle || undefined;
  const ogLocale = language === "pl" ? "pl_PL" : "en_US";
  const ogLocaleAlternate = language === "pl" ? "en_US" : "pl_PL";

  const showFallback =
    !pageKey && !shouldSuppressFallbackSeo && location.pathname === "/";

  return (
    <Helmet>
      <html lang={language} />
      {safeImageUrl(identity?.faviconUrl) && (
        <link rel="icon" href={safeImageUrl(identity?.faviconUrl)} />
      )}
      {seo?.keywords && seo.keywords.length > 0 && (
        <meta name="keywords" content={seo.keywords.join(", ")} />
      )}
      {showFallback && seo?.siteTitle ? <title>{seo.siteTitle}</title> : null}
      {showFallback && siteDescription ? (
        <meta name="description" content={siteDescription} />
      ) : null}
      {showFallback && canonicalUrl ? (
        <link rel="canonical" href={canonicalUrl} />
      ) : null}
      {showFallback ? <meta name="robots" content={robots} /> : null}

      {siteUrl &&
        !pageKey &&
        !shouldSuppressFallbackSeo &&
        SUPPORTED_LOCALES.map((locale) => {
          const suffix =
            pathWithoutLocale === "/" ? "" : pathWithoutLocale.slice(1);
          const href = joinUrlPath(siteUrl, localizedPath(locale, suffix));
          return (
            <link key={locale} rel="alternate" hrefLang={locale} href={href} />
          );
        })}
      {siteUrl && !pageKey && !shouldSuppressFallbackSeo ? (
        <link
          rel="alternate"
          hrefLang="x-default"
          href={joinUrlPath(
            siteUrl,
            localizedPath(
              "en",
              pathWithoutLocale === "/" ? "" : pathWithoutLocale.slice(1),
            ),
          )}
        />
      ) : null}

      {showFallback && seo?.siteTitle ? (
        <meta property="og:title" content={seo.siteTitle} />
      ) : null}
      {showFallback && siteDescription ? (
        <meta property="og:description" content={siteDescription} />
      ) : null}
      {showFallback ? <meta property="og:type" content="website" /> : null}
      {showFallback && canonicalUrl ? (
        <meta property="og:url" content={canonicalUrl} />
      ) : null}
      {showFallback && ogImage ? (
        <meta property="og:image" content={ogImage} />
      ) : null}
      {showFallback && ogImage ? (
        <meta property="og:image:width" content="1200" />
      ) : null}
      {showFallback && ogImage ? (
        <meta property="og:image:height" content="630" />
      ) : null}
      {showFallback && ogImage ? (
        <meta property="og:image:alt" content={seo?.siteTitle || "VezVision"} />
      ) : null}
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={ogLocaleAlternate} />
      {ogSiteName && <meta property="og:site_name" content={ogSiteName} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vezvision" />
      <meta name="twitter:creator" content="@vezvision" />
      {showFallback && seo?.siteTitle ? (
        <meta name="twitter:title" content={seo.siteTitle} />
      ) : null}
      {showFallback && siteDescription ? (
        <meta name="twitter:description" content={siteDescription} />
      ) : null}
      {showFallback && ogImage ? (
        <meta name="twitter:image" content={ogImage} />
      ) : null}

      {siteUrl ? (
        <>
          <link
            rel="alternate"
            type="application/rss+xml"
            title="VezVision Blog (PL)"
            href={joinUrlPath(siteUrl, "/pl/blog/feed.xml")}
          />
          <link
            rel="alternate"
            type="application/rss+xml"
            title="VezVision Blog (EN)"
            href={joinUrlPath(siteUrl, "/en/blog/feed.xml")}
          />
        </>
      ) : null}
    </Helmet>
  );
};

export default SEO;
