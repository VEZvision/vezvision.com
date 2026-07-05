# Architectural Decision Record — Database Schema Scope

**Date:** 2026-06-19
**Status:** Accepted
**Context:** Code review 2026-06-19 identified tables in `public` schema that are not used by the public marketing site (vezvision.com) but belong to VEZcore, the private core for managing the grupa VEZ ecosystem.

## Tables in scope

### Public marketing site (vezvision.com)

These tables are actively queried by the public SPA and Edge Functions:

- `vv_site_settings`, `vv_page_seo`, `vv_page_sections`, `vv_legal_documents`
- `vv_blog_posts`, `vv_blog_categories`, `vv_blog_post_categories`, `vv_blog_post_views`
- `vv_projects`, `vv_project_categories`, `vv_project_category_assignments`, `vv_project_technologies`, `vv_project_images`
- `vv_services`, `vv_service_categories`, `vv_service_category_assignments`
- `vv_faq_categories`, `vv_faq_items`
- `vv_newsletter_subscribers`
- `messages`
- `rate_limits`, `rate_limit_buckets`

### VEZcore private platform (shared database)

These tables are NOT queried by the public site. They support VEZcore modules such as private CMS, CRM, file management, calendar, and operational dashboards:

- `profiles`, `user_permissions` — RBAC (0 rows)
- `vv_folders`, `vv_files`, `vv_file_permissions`, `vv_file_events` — file manager (0-2 rows)
- `vv_calendar_events` — calendar (0 rows)
- `vv_newsletter_campaigns`, `vv_newsletter_send_logs`, `vv_newsletter_templates` — newsletter campaign management (1-2 rows, used by admin + `retry-message-sends` edge function)
- `vv_message_send_logs` — contact message send tracking (used by `retry-message-sends` edge function)

## Decision

**Keep all tables in the current `public` schema.** Do NOT move VEZcore tables to a separate schema or database at this time.

### Rationale

1. **Shared edge functions**: `retry-message-sends` edge function reads from `vv_message_send_logs` and `vv_newsletter_send_logs`. Moving these would break the cron retry pipeline.
2. **Cross-schema RLS complexity**: VEZcore queries user identity (`profiles`) and permissions (`user_permissions`) which are FK-linked to `auth.users`. Splitting schemas would require cross-schema RLS policies — fragile and hard to maintain.
3. **Zero cost of keeping**: Unused tables with 0 rows have negligible storage impact. RLS policies already prevent public access (verified by Supabase security advisors — no permissive policies on these tables).
4. **Migration risk**: Moving tables to a separate schema/database is a high-risk operation requiring downtime, app code changes in VEZcore, and careful FK handling. The benefit (cleaner `public` schema) does not justify the risk at current scale.
5. **Future option preserved**: If VEZcore grows significantly or needs independent scaling, the `vezDatabase` project (`glgldtfuvahmrlkywdoy`, eu-west-1) already exists as a potential migration target. This decision can be revisited without lock-in.

### Risk mitigation

- All VEZcore tables have RLS enabled (verified 2026-06-19).
- `REVOKE EXECUTE FROM PUBLIC` applied to all SECURITY DEFINER functions (migration `20260619100000`).
- FK indexes added to all tables (migration `20260619120000`) — admin query performance is now optimal.
- Supabase security advisors show NO permissive policies on VEZcore tables.

## Revisit triggers

Revisit this decision if any of:

- VEZcore tables grow beyond 10k rows each
- Public site experiences query performance degradation traceable to shared tables
- VEZcore needs independent deploy/release cadence
- Security audit requires stricter schema isolation
