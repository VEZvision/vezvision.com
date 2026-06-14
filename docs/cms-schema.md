# VezVision CMS Schema (public website)

Reference for tables and keys used by the marketing site (`src/services/`).

Content is authored in **VezCore** (separate admin app, same Supabase project). This repo is read-only for CMS data — there is no `/admin` route here.

## `vv_site_settings` (public keys)

| Key | Purpose |
|-----|---------|
| `site_identity` | Name, logo |
| `contact` | Email, phone, address |
| `social` | Social URLs |
| `seo` | Default meta, `siteUrl` |
| `code_injection` | Head/body snippets (sanitized client-side) |
| `maintenance_mode` | `enabled` (public) |
| `maintenance_allowlist` | IP allowlist during maintenance (private, edge only) |
| `seo_files` | robots/sitemap hints |
| `company` | Legal entity info |
| `navigation` | Nav items, CTA |
| `footer` | Footer copy, legal links |

RLS: `is_public = true` for anon SELECT.

## `vv_page_sections`

| `page_key` | `section_key` examples |
|------------|------------------------|
| `home` | `hero`, `founder_note`, `benefits`, `features`, `potential`, `process`, `about_comparison`, `products_teaser`, `newsletter`, `contact` |
| `about` | `hero`, `header`, `cards`, `values`, `about_comparison`, `why_choose`, `faq`, `contact` |
| `contact` | `hero`, `form`, `faq`, `contact` |

RLS: `is_public = true`.

## `vv_page_seo`

Page keys: `home`, `about`, `services`, `portfolio`, `blog`, `products`, `contact`, `privacy-policy`, `terms`, `cookie-policy`, `unsubscribe`, `not-found`.

## `vv_legal_documents`

Document keys: `privacy_policy`, `terms`, `cookie_policy`.

RLS: `is_published = true`.

## Content tables

| Table | Public filter |
|-------|----------------|
| `vv_blog_posts` | `status = published`, `published_at <= now()` (app + RLS) |
| `vv_projects` | `status = published` |
| `vv_services` | `status = active` |
| `vv_faq_items` | `is_active = true` |

## Edge functions (writes)

| Function | RPC / table |
|----------|-------------|
| `submit-contact` | `safe_insert_contact_message` |
| `subscribe-newsletter` | `safe_insert_newsletter_subscriber` |
| `unsubscribe-newsletter` | `unsubscribe_by_token` |
| `check-maintenance-access` | reads `maintenance_mode` |

## Regenerate types

```bash
npm run gen:types        # production project (npx supabase)
npm run gen:types:local  # local Supabase (`supabase start`)
```
