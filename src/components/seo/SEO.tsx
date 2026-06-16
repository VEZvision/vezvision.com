import { Helmet } from 'react-helmet-async';
import { useSettings } from '@/hooks/useSettings';
import { useLocation } from 'react-router-dom';
import { useLanguageContext } from '@/hooks/useLanguage';
import { safeAbsoluteHttpUrl, safeImageUrl } from '@/utils/safeHref';
import { getPageKeyFromPath, isDynamicContentPath, SUPPORTED_LOCALES } from '@/routing/routes.config';
import { localizedPath, stripLocaleFromPathname } from '@/routing/locale';

const SEO = () => {
    const { seo, identity, pageSeo } = useSettings();
    const { language } = useLanguageContext();
    const location = useLocation();

    if (!seo && !identity) return null;

    const pageKey = getPageKeyFromPath(location.pathname);
    const hasDedicatedPageSeo = pageKey ? Boolean(pageSeo?.[pageKey]) : false;
    const shouldSuppressFallbackSeo = isDynamicContentPath(location.pathname);
    const siteUrl = safeAbsoluteHttpUrl(seo?.siteUrl) || (typeof window !== 'undefined' ? window.location.origin : '');
    const pathWithoutLocale = stripLocaleFromPathname(location.pathname);
    const canonicalUrl = siteUrl ? `${siteUrl}${localizedPath(language, pathWithoutLocale === '/' ? '' : pathWithoutLocale.slice(1))}` : '';
    const ogImage = safeImageUrl(identity?.defaultOgImageUrl) || safeImageUrl(identity?.logoUrl) || (siteUrl ? `${siteUrl}/Logo_vezvision_optimized.svg` : '');
    const siteDescription = seo?.siteDescription || undefined;
    const robots = seo?.robots || 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';
    const ogSiteName = seo?.ogSiteName || identity?.siteName || seo?.siteTitle || undefined;
    const ogLocale = language === 'pl' ? 'pl_PL' : 'en_US';
    const ogLocaleAlternate = language === 'pl' ? 'en_US' : 'pl_PL';

    return (
        <Helmet defaultTitle={seo?.siteTitle}>
            <html lang={language} />
            {safeImageUrl(identity?.faviconUrl) && <link rel="icon" href={safeImageUrl(identity?.faviconUrl)} />}
            {seo?.keywords && seo.keywords.length > 0 && <meta name="keywords" content={seo.keywords.join(', ')} />}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && seo?.siteTitle ? <title>{seo.siteTitle}</title> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && siteDescription ? <meta name="description" content={siteDescription} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo ? <meta name="robots" content={robots} /> : null}

            {siteUrl && !shouldSuppressFallbackSeo && SUPPORTED_LOCALES.map((locale) => {
                const suffix = pathWithoutLocale === '/' ? '' : pathWithoutLocale.slice(1);
                const href = `${siteUrl}${localizedPath(locale, suffix)}`;
                return (
                    <link
                        key={locale}
                        rel="alternate"
                        hrefLang={locale}
                        href={href}
                    />
                );
            })}
            {siteUrl && !shouldSuppressFallbackSeo ? (
                <link rel="alternate" hrefLang="x-default" href={`${siteUrl}${localizedPath('pl', pathWithoutLocale === '/' ? '' : pathWithoutLocale.slice(1))}`} />
            ) : null}

            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && seo?.siteTitle ? <meta property="og:title" content={seo.siteTitle} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && siteDescription ? <meta property="og:description" content={siteDescription} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo ? <meta property="og:type" content="website" /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && ogImage ? <meta property="og:image" content={ogImage} /> : null}
            <meta property="og:locale" content={ogLocale} />
            <meta property="og:locale:alternate" content={ogLocaleAlternate} />
            {ogSiteName && <meta property="og:site_name" content={ogSiteName} />}

            <meta name="twitter:card" content="summary_large_image" />
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && seo?.siteTitle ? <meta name="twitter:title" content={seo.siteTitle} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && siteDescription ? <meta name="twitter:description" content={siteDescription} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

            {siteUrl ? (
                <>
                    <link rel="alternate" type="application/rss+xml" title="VezVision Blog (PL)" href={`${siteUrl}/pl/blog/feed.xml`} />
                    <link rel="alternate" type="application/rss+xml" title="VezVision Blog (EN)" href={`${siteUrl}/en/blog/feed.xml`} />
                </>
            ) : null}
        </Helmet>
    );
};

export default SEO;
