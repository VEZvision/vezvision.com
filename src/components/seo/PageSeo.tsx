import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

import { useLanguageContext } from '@/hooks/useLanguage'
import { useSettings } from '@/hooks/useSettings'

function getLocalizedValue(language: 'pl' | 'en', plValue: string, enValue: string) {
  return language === 'en' ? (enValue || plValue) : plValue
}

function getRobots(indexable: boolean, robots: string, fallback: string) {
  if (!indexable) return 'noindex,nofollow'
  return robots || fallback
}

interface PageSeoProps {
  pageKey: string
}

const PageSeo = ({ pageKey }: PageSeoProps) => {
  const { language } = useLanguageContext()
  const { pageSeo, seo, identity } = useSettings()
  const location = useLocation()

  const entry = pageSeo?.[pageKey]
  if (!entry) return null

  const siteUrl = seo?.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  const canonicalUrl = entry.canonical_url || (siteUrl ? `${siteUrl}${location.pathname === '/' ? '' : location.pathname}` : '')
  const title = getLocalizedValue(language, entry.title_pl, entry.title_en)
  const description = getLocalizedValue(language, entry.description_pl, entry.description_en)
  const ogTitle = getLocalizedValue(language, entry.og_title_pl, entry.og_title_en) || title
  const ogDescription = getLocalizedValue(language, entry.og_description_pl, entry.og_description_en) || description
  const robots = getRobots(entry.indexable, entry.robots, seo?.robots || 'index,follow')
  const ogImage = entry.og_image_url || identity?.defaultOgImageUrl || identity?.logoUrl || ''
  const ogSiteName = seo?.ogSiteName || identity?.siteName || seo?.siteTitle || ''

  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      <meta name="robots" content={robots} />
      {ogTitle ? <meta property="og:title" content={ogTitle} /> : null}
      {ogDescription ? <meta property="og:description" content={ogDescription} /> : null}
      <meta property="og:type" content="website" />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {ogSiteName ? <meta property="og:site_name" content={ogSiteName} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      {ogTitle ? <meta name="twitter:title" content={ogTitle} /> : null}
      {ogDescription ? <meta name="twitter:description" content={ogDescription} /> : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {entry.structured_data_json ? <script type="application/ld+json">{entry.structured_data_json}</script> : null}
    </Helmet>
  )
}

export default PageSeo
