# Supabase migrations — website vs VezCore admin

This repo shares the **vezvisionWEB** Supabase project (`pcxcqbpygyidkusetghk`) with **VezCore** — the admin/CMS app where blog, portfolio, FAQ, settings, and CRM data are edited.

The **public marketing site** (`website`) reads the same database via RLS but no longer ships `/admin`. CRM tables and policies remain in this project because VezCore manages them from a separate codebase.

## What this site uses (`vv_*` + portfolio)

| Table / function | Purpose | Edited from |
|---|---|---|
| `vv_site_settings` | Maintenance, contact, code injection, nav | VezCore |
| `vv_page_seo`, `vv_page_sections` | Page SEO & section CMS | VezCore |
| `vv_blog_posts`, `vv_blog_categories` | Blog | VezCore |
| `vv_blog_post_views` | Per-IP blog view dedup | Website migration |
| `vv_blog_increment_views(p_post_slug, p_client_ip)` | View counter RPC | Edge `increment-blog-view` only (`service_role`) |
| `vv_faq_items`, `vv_faq_categories` | FAQ | VezCore |
| `vv_legal_documents` | Privacy / terms / cookies | VezCore |
| `vv_portfolio_*` | Portfolio projects | VezCore |

CRM/HR/project-management tables in older migrations are **still live** for VezCore — do not drop them from production when working on the website.

## Recent website migrations

- `20260608100000_blog_rls_published_at.sql` — scheduled publish RLS
- `20260608110000_vv_faq_items.sql` — FAQ schema baseline
- `20260608120000_align_blog_increment_views_rpc.sql` — `p_post_slug` RPC signature
- `20260608130000_faq_policy_cleanup.sql` — duplicate policy cleanup
- `20260609100000_harden_public_settings.sql` — private `maintenance_allowlist`, `code_injection`
- `20260609140000_revoke_legacy_admin_login.sql` — remove legacy `admin_login`
- `20260610120000_revoke_consume_rate_limit_public.sql` — rate limit RPC service_role only
- `20260610120050_create_vv_blog_post_views.sql` — dedup table for blog views
- `20260610120100_blog_views_ip_dedup.sql` — IP dedup + service_role-only RPC

Some objects (e.g. `messages`, FAQ admin policies, `unsubscribe_by_token`) may be owned by **VezCore** migrations — verify on shared prod before `db reset`.

## Types

```bash
# Production schema (recommended before deploy)
npm run gen:types

# Local Supabase stack
npm run gen:types:local
```

Requires Supabase CLI (`npx supabase` works if not installed globally).

## Notes

- Do **not** delete applied migrations from remote history; use `supabase migration repair` if filenames diverge.
- Migrations in `supabase/migrations/` include VezCore/CRM history — required for `db reset` parity with production.
