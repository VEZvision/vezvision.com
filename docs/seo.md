# VezVision SEO Strategy

## Overview

VezVision employs a world-class SEO strategy covering traditional search (Google), AI search (ChatGPT, Perplexity, Google SGE), and social media (Open Graph).

## Structured Data (JSON-LD)

### Global (all pages)

- `Organization` with `@id`, `name`, `url`, `logo`, `sameAs` (social profiles), `knowsAbout` (AI/web/automation expertise), `contactPoint`
- `WebSite` with `@id`, `publisher`, `potentialAction: SearchAction` (blog search)
- `ProfessionalService` / `LocalBusiness` with address, NIP, REGON
- `Service` with `serviceType`, `provider`, `areaServed`

### Per-page

- `WebPage` with `@id`, `isPartOf`, `publisher`, `inLanguage`
- `BreadcrumbList` for blog/portfolio detail pages
- `BlogPosting` for blog articles with `author`, `datePublished`, `dateModified`, `image`, `articleSection`, `keywords`
- `FAQPage` for FAQ section
- `ItemList` for portfolio listing
- `VideoObject` for hero video

### Open Graph + Twitter Cards

- Full OG tags: title, description, image, url, type, locale, locale:alternate, site_name
- Article-specific OG: `article:published_time`, `article:modified_time`, `article:author`, `article:section`, `article:tag`
- Twitter Card: `summary_large_image`

## AI SEO

### llms.txt

`public/llms.txt` — curated content map for AI crawlers. Includes sections: About, What we do, Services, Portfolio, Products, Blog, FAQ, Key pages, Content sources, Contact.

### ai.txt

`public/ai.txt` — usage preferences for AI systems (Spawning.ai standard). Grants retrieval and summarization with attribution; prohibits training without consent.

### robots.txt AI sections

Explicit `Allow` for: GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended.

### Internal linking

Auto-linker in `sanitizeCmsHtml` hook — links service keywords (AI, automation, websites) to relevant pages.

## Internationalization

- `hreflang` for PL/EN with `x-default` → EN (international-first strategy)
- Dynamic `<html lang>` via Helmet
- Sitemap with per-locale URLs
- RSS feeds per locale (`/pl/blog/feed.xml`, `/en/blog/feed.xml`)

## Sitemap

- Generated from CMS at build time (`scripts/generate-sitemap.ts`)
- Static pages: `lastmod` from `vv_site_settings.updated_at`
- Blog/portfolio: `lastmod` from `updated_at`, `image:image` for featured/cover images
- `changefreq` and `priority` per route type

## Performance as Ranking Signal

- Lighthouse CI with budget: LCP < 3s, CLS < 0.1, INP < 200ms
- Brotli + gzip compression for all assets
- `preconnect` to Supabase, font CDNs
- `font-display: swap` for fonts
- WebM video (VP9) as first source, MP4 fallback
- WebP/AVIF srcset via vite-imagetools
- React Compiler for automatic memoization
- Web Vitals RUM reporting to GA

## Self-hosting Fonts (Future)

Currently using Fontshare CDN (Satoshi) and Google Fonts (Inter) with `preconnect`.

To self-host Satoshi:

1. Download WOFF2 files from fontshare.com (ITF Free Font License allows self-hosting)
2. Place in `public/fonts/satoshi/`
3. Add `@font-face` declarations in `src/index.css`
4. Remove Fontshare `<link>` from `index.html`
5. Benefit: eliminates SPOF, improves LCP by ~100-200ms

## Monitoring

- Lighthouse CI per PR (`.github/lighthouserc.json`)
- Web Vitals RUM via `web-vitals` library → GA events
- Sentry performance monitoring (`tracesSampleRate: 0.2`)
