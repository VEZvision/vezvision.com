import { Helmet } from 'react-helmet-async';
import { useSettings } from '@/hooks/useSettings';
import { useLocation } from 'react-router-dom';
import { useLanguageContext } from '@/hooks/useLanguage';
import { safeAbsoluteHttpUrl, safeImageUrl } from '@/utils/safeHref';

const STATIC_PAGE_KEYS: Record<string, string> = {
    '/': 'home',
    '/about': 'about',
    '/services': 'services',
    '/portfolio': 'portfolio',
    '/blog': 'blog',
    '/products': 'products',
    '/contact': 'contact',
    '/privacy-policy': 'privacy-policy',
    '/terms': 'terms',
    '/cookie-policy': 'cookie-policy',
    '/unsubscribe': 'unsubscribe',
    '/newsletter': 'newsletter',
    '/404': 'not-found',
};

function isDynamicContentPath(pathname: string) {
    return pathname.startsWith('/blog/') || pathname.startsWith('/portfolio/') || pathname.startsWith('/offer/') || pathname.startsWith('/client')
}

const SEO = () => {
    const { seo, identity, pageSeo } = useSettings();
    const { language } = useLanguageContext();
    const location = useLocation();

    if (!seo && !identity) return null;

    const matchedPageKey = STATIC_PAGE_KEYS[location.pathname];
    const hasDedicatedPageSeo = matchedPageKey ? Boolean(pageSeo?.[matchedPageKey]) : false;
    const shouldSuppressFallbackSeo = !matchedPageKey && !isDynamicContentPath(location.pathname);
    const siteUrl = safeAbsoluteHttpUrl(seo?.siteUrl) || (typeof window !== 'undefined' ? window.location.origin : '');
    const canonicalUrl = siteUrl ? `${siteUrl}${location.pathname === '/' ? '' : location.pathname}` : '';
    const ogImage = safeImageUrl(identity?.defaultOgImageUrl) || safeImageUrl(identity?.logoUrl) || (siteUrl ? `${siteUrl}/Logo_vezvision_optimized.svg` : '');
    const siteDescription = seo?.siteDescription || undefined;
    const robots = seo?.robots || 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';
    const ogSiteName = seo?.ogSiteName || identity?.siteName || seo?.siteTitle || undefined;

    return (
            <Helmet defaultTitle={seo?.siteTitle}>
            <html lang={language} />
            {safeImageUrl(identity?.faviconUrl) && <link rel="icon" href={safeImageUrl(identity?.faviconUrl)} />}
            {seo?.keywords && seo.keywords.length > 0 && <meta name="keywords" content={seo.keywords.join(', ')} />}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && seo?.siteTitle ? <title>{seo.siteTitle}</title> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && siteDescription ? <meta name="description" content={siteDescription} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo ? <meta name="robots" content={robots} /> : null}

            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && seo?.siteTitle ? <meta property="og:title" content={seo.siteTitle} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && siteDescription ? <meta property="og:description" content={siteDescription} /> : null}
            <meta property="og:type" content="website" />
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && ogImage ? <meta property="og:image" content={ogImage} /> : null}
            <meta property="og:locale" content="pl_PL" />
            <meta property="og:locale:alternate" content="en_US" />
            {ogSiteName && <meta property="og:site_name" content={ogSiteName} />}

            <meta name="twitter:card" content="summary_large_image" />
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && seo?.siteTitle ? <meta name="twitter:title" content={seo.siteTitle} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && siteDescription ? <meta name="twitter:description" content={siteDescription} /> : null}
            {!hasDedicatedPageSeo && !shouldSuppressFallbackSeo && ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
        </Helmet>
    );
};

export default SEO;
