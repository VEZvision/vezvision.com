import { supabase } from '@/lib/supabase'

export interface SitemapRoute {
  url: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildSitemapXml(routes: SitemapRoute[]): string {
  const urls = routes
    .map(
      (route) =>
        `  <url>\n    <loc>${escapeXml(route.url)}</loc>${route.lastmod ? `\n    <lastmod>${route.lastmod}</lastmod>` : ''}${route.changefreq ? `\n    <changefreq>${route.changefreq}</changefreq>` : ''}${route.priority !== undefined ? `\n    <priority>${route.priority}</priority>` : ''}\n  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
}

export async function generateSitemap(): Promise<string> {
  const [{ data: posts }, { data: projects }, { data: siteSettings }] = await Promise.all([
    supabase.from('vv_blog_posts').select('slug,updated_at').eq('status', 'published').limit(100),
    supabase.from('vv_projects').select('slug,updated_at').limit(100),
    supabase.from('vv_site_settings').select('value').eq('key', 'seo').single(),
  ])

  const baseUrl = (
    (siteSettings?.value as Record<string, unknown>)?.siteUrl as string ||
    import.meta.env.VITE_SITE_URL ||
    'https://vezvision.com'
  ).replace(/\/$/, '')

  const routes: SitemapRoute[] = [
    { url: `${baseUrl}/`, changefreq: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/about`, changefreq: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/services`, changefreq: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/portfolio`, changefreq: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, changefreq: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/newsletter`, changefreq: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/products`, changefreq: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, changefreq: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/cookie-policy`, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy-policy`, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, changefreq: 'yearly', priority: 0.3 },
  ]

  if (posts) {
    for (const post of posts) {
      routes.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastmod: post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : undefined,
        changefreq: 'monthly',
        priority: 0.7,
      })
    }
  }

  if (projects) {
    for (const project of projects) {
      routes.push({
        url: `${baseUrl}/portfolio/${project.slug}`,
        lastmod: project.updated_at ? new Date(project.updated_at).toISOString().split('T')[0] : undefined,
        changefreq: 'monthly',
        priority: 0.7,
      })
    }
  }

  return buildSitemapXml(routes)
}
