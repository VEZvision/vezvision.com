# Migration Drift & Baseline Strategy

**Date:** 2026-06-19 (updated 2026-08-09)
**Status:** Legacy pre-reset migrations removed from the active repository tree

## Current state

- **Local repo:** 46 active migrations in `supabase/migrations/`
- **Removed from the current tree:** 69 pre-reset migrations that contained obsolete
  schemas, demo data and a historical default administrator credential
- **Live DB (`pcxcqbpygyidkusetghk`):** 89 migrations applied (recorded in `supabase_migrations.schema_migrations`)
- **Active baseline:** `20260328145106_vezvision_fresh_schema` and everything after: matches live DB state

## What happened

The project underwent a full schema reset on 2026-03-28 (`vezvision_fresh_schema`). The fresh schema migration created a clean database, and subsequent migrations built on top of it. The 69 pre-reset migration files (CRM, HR, finance, AiConfig, ClientPortal, etc.) were left in the repo but were no longer part of the live migration history.

On 2026-07-08 the orphaned files were moved out of the active migration path. On
2026-08-09 they were removed from the current public repository tree because they
were not required for deployment and included unsafe historical defaults. Earlier
commits remain an audit record until a separately approved history rewrite is made.

## Why this is safe

- Orphans never applied to the live DB (Supabase recorded fresh schema as the active baseline)
- Cutting them out from the migrations root does not change live DB state
- Only the active migration set remains in `supabase/migrations/`
- `supabase db push` is now safe against the live DB with the local migration set

## Remaining drift (minor)

Some migration filenames in the local repo do not match the version timestamps recorded on the live DB (e.g., local `20260331100000_vv_site_settings.sql` vs live `20260331201718_vv_site_settings`). This is a name-only mismatch and does not affect DB state.

## Current workflow

```
Developer writes migration SQL
  → Reviews it against the dedicated Hetzner PostgreSQL schema
  → Backs up the target database
  → Applies the migration through the controlled deployment path
  → Saves the same SQL in version control and verifies schema drift
```

The standalone production source of truth is `deploy/hetzner/schema.sql`; legacy
Supabase migrations are retained only where they document the active schema lineage.
