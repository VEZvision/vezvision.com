-- Performance indexes for public website hot paths.
-- These tables are queried on every page load by key/page_key.

CREATE UNIQUE INDEX IF NOT EXISTS vv_site_settings_key_idx
  ON public.vv_site_settings (key);

CREATE UNIQUE INDEX IF NOT EXISTS vv_page_sections_page_key_idx
  ON public.vv_page_sections (page_key);

CREATE UNIQUE INDEX IF NOT EXISTS vv_page_seo_page_key_idx
  ON public.vv_page_seo (page_key);

CREATE UNIQUE INDEX IF NOT EXISTS vv_legal_documents_page_language_idx
  ON public.vv_legal_documents (page_key, language);
