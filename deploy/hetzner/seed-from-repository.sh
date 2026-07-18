#!/usr/bin/env bash
set -euo pipefail

# Loads only the versioned INSERT statements. It deliberately does not re-run
# Supabase-specific triggers, policies or grants from the source migrations.
root="$(cd "$(dirname "$0")/../.." && pwd)"
database_url="${DATABASE_URL:?Set DATABASE_URL for the dedicated vezvision database}"

for migration in \
  20260331100000_vv_site_settings.sql \
  20260331113000_vv_footer_navigation_settings.sql \
  20260331130000_vv_page_seo.sql \
  20260331143000_vv_legal_documents.sql \
  20260331160000_vv_page_sections.sql; do
  sed -n '/^INSERT INTO public\./,$p' "$root/supabase/migrations/$migration"
done | psql "$database_url" -v ON_ERROR_STOP=1
