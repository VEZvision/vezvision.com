# Migration Drift & Baseline Strategy

**Date:** 2026-06-19
**Status:** Documented — safe baseline approach adopted (no destructive reset)

## Current state

- **Local repo:** 114 migration files in `supabase/migrations/`
- **Live DB (`pcxcqbpygyidkusetghk`):** 89 migrations applied (recorded in `supabase_migrations.schema_migrations`)
- **Drift:** 62 local files from 2024–early 2025 are orphaned — they target tables/schemas that were reset by `20260328145106_vezvision_fresh_schema` and will never be applied to the live DB.

## Why this happened

The project underwent a full schema reset on 2026-03-28 (`vezvision_fresh_schema`). The fresh schema migration created a clean database, and subsequent migrations built on top of it. The 62 pre-reset migration files (CRM, HR, finance, AiConfig, ClientPortal, etc.) were left in the repo but are no longer part of the live migration history.

Additionally, some migration filenames in the local repo do not match the version timestamps recorded on the live DB (e.g., local `20260331100000_vv_site_settings.sql` vs live `20260331201718_vv_site_settings`).

## Risk

Running `supabase db push` against the live DB with the current local migration set would:

1. Attempt to apply orphaned migrations → fail (tables already exist from fresh schema)
2. Report version conflicts for renamed migrations
3. Potentially leave the DB in an inconsistent state

## Adopted approach: Safe baseline (no destructive reset)

Rather than performing a destructive reset (which would require downtime and risk data loss), we adopt a **safe baseline** approach:

### 1. Document the drift (this file)

The drift is now documented. Developers are aware that `supabase db push` should NOT be run against the live DB with the current local migration set.

### 2. Apply new migrations via Supabase MCP

All new migrations are applied directly to the live DB via the Supabase MCP tools (`supabase_apply_migration` or `supabase_execute_sql`), then registered in `supabase_migrations.schema_migrations`. This is the current workflow and it works reliably.

### 3. Local migration files serve as history

The 114 local files remain as historical record. They are NOT applied via `supabase db push`. New migrations are added to the local repo for version control and applied to live DB separately.

### 4. Future consolidation (optional, low priority)

If full consolidation is desired in the future:

1. Create a branch: `git checkout -b chore/migration-baseline`
2. Run `supabase db pull` on the live DB to export the current schema
3. Create a single baseline file: `20260620_baseline_from_live.sql`
4. Move all 114 old files to `supabase/migrations/_archive/`
5. Reset `supabase_migrations.schema_migrations` on a **new** database (not the live one)
6. Apply the baseline to the new database
7. Test the full app against the new database
8. If green, swap the new database to production (requires coordination with Supabase support)

This is a larger initiative that should only be undertaken when the team has bandwidth for a coordinated database migration with proper testing.

## Current workflow (working, safe)

```
Developer writes migration SQL
  → Applies to live DB via supabase_apply_migration (MCP)
  → Saves the same SQL to supabase/migrations/{timestamp}_{name}.sql (for version control)
  → Migration is recorded in supabase_migrations.schema_migrations automatically
```

This workflow avoids the drift problem entirely — no `db push`, no version conflicts, no risk to the live DB.
