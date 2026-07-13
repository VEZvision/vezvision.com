# Migration Drift & Baseline Strategy

**Date:** 2026-06-19 (updated 2026-07-08)
**Status:** Drift archived — orphaned migrations moved to `_archive-pre-202603/`

## Current state

- **Local repo:** 46 active migrations in `supabase/migrations/`
- **Archived:** 69 pre-reset migrations moved to `supabase/migrations/_archive-pre-202603/` (kept as historical record, no longer on the migration path)
- **Live DB (`pcxcqbpygyidkusetghk`):** 89 migrations applied (recorded in `supabase_migrations.schema_migrations`)
- **Active baseline:** `20260328145106_vezvision_fresh_schema` and everything after — matches live DB state

## What happened

The project underwent a full schema reset on 2026-03-28 (`vezvision_fresh_schema`). The fresh schema migration created a clean database, and subsequent migrations built on top of it. The 69 pre-reset migration files (CRM, HR, finance, AiConfig, ClientPortal, etc.) were left in the repo but were no longer part of the live migration history.

On 2026-07-08 the orphans were moved into `supabase/migrations/_archive-pre-202603/`. They remain as historical reference. Subdirectories of `supabase/migrations/` are not picked up by the Supabase CLI migration runner, so they can no longer cause drift-related `db push` failures.

## Why this is safe

- Orphans never applied to the live DB (Supabase recorded fresh schema as the active baseline)
- Cutting them out from the migrations root does not change live DB state
- Migrations are now organized: active set in root, archive under `_archive-pre-202603/`
- `supabase db push` is now safe against the live DB with the local migration set

## Remaining drift (minor)

Some migration filenames in the local repo do not match the version timestamps recorded on the live DB (e.g., local `20260331100000_vv_site_settings.sql` vs live `20260331201718_vv_site_settings`). This is a name-only mismatch and does not affect DB state.

## Current workflow

```
Developer writes migration SQL
  → Applies to live DB via supabase_apply_migration (MCP)
  → Saves the same SQL to supabase/migrations/{timestamp}_{name}.sql (for version control)
  → Migration is recorded in supabase_migrations.schema_migrations automatically
```

This workflow avoids the drift problem entirely — `db push` is safe, no version conflicts, no risk to the live DB.

