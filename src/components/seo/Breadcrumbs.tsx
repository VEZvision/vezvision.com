import { Helmet } from 'react-helmet-async'

import { useSettings } from '@/hooks/useSettings'
import { safeAbsoluteHttpUrl } from '@/utils/safeHref'
import { safeJsonLd } from '@/utils/safeJsonLd'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { seo } = useSettings()
  const siteUrl = safeAbsoluteHttpUrl(seo?.siteUrl)

  if (items.length === 0) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href && siteUrl ? `${siteUrl}${item.href}` : undefined,
    })),
  }

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{safeJsonLd(schema)}</script>
      </Helmet>
      <nav aria-label="Breadcrumb" className="relative z-10">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500 py-4">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                {isLast || !item.href ? (
                  <span className="text-gray-900" aria-current="page">{item.label}</span>
                ) : (
                  <a href={item.href} className="hover:text-gray-900 transition-colors">{item.label}</a>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
