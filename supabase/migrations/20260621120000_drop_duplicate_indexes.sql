-- Drop 4 duplicate indexes (keep idx_* named ones from 20260619, drop older vv_*_idx)
-- Supabase Performance Advisor WARN: duplicate_index on vv_files and vv_folders
-- Applied via Supabase MCP on 2026-06-21.

DROP INDEX IF EXISTS public.vv_files_folder_idx;
DROP INDEX IF EXISTS public.vv_files_owner_idx;
DROP INDEX IF EXISTS public.vv_folders_owner_idx;
DROP INDEX IF EXISTS public.vv_folders_parent_idx;
