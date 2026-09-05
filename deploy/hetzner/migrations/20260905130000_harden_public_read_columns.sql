-- Limit anonymous PostgREST reads to the exact columns used by the public site.
-- RLS still enforces publication state; column grants add a second boundary so
-- internal ownership and scheduling metadata cannot be requested with select=*.
BEGIN;

ALTER TABLE public.vv_products
  ADD COLUMN IF NOT EXISTS title_display text NOT NULL DEFAULT 'text';
ALTER TABLE public.vv_products
  ADD COLUMN IF NOT EXISTS logo_url text;

REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;

GRANT SELECT (key, value, is_public, updated_at) ON public.vv_site_settings TO anon;
GRANT SELECT (page_key, title_pl, title_en, description_pl, description_en,
  og_title_pl, og_title_en, og_description_pl, og_description_en, og_image_url,
  canonical_url, robots, indexable, is_public) ON public.vv_page_seo TO anon;
GRANT SELECT (document_key, title_pl, title_en, content_pl, content_en, version,
  last_updated, is_published) ON public.vv_legal_documents TO anon;

GRANT SELECT (id, slug, name_pl, name_en, color, order_index, created_at)
  ON public.vv_blog_categories TO anon;
GRANT SELECT (id, slug, status, featured, featured_image, reading_time,
  views_count, published_at, title_pl, title_en, excerpt_pl, excerpt_en,
  content_pl, content_en, meta_title_pl, meta_title_en, meta_desc_pl,
  meta_desc_en, tags_pl, tags_en, created_at, updated_at)
  ON public.vv_blog_posts TO anon;
GRANT SELECT (post_id, category_id, is_primary)
  ON public.vv_blog_post_categories TO anon;

GRANT SELECT (id, slug, name_pl, name_en, order_index, created_at)
  ON public.vv_project_categories TO anon;
GRANT SELECT (id, slug, status, featured, order_index, cover_image, demo_url,
  github_url, client_name, title_pl, title_en, show_cover_image, show_demo_url,
  show_challenge, show_solution, short_desc_pl, short_desc_en, description_pl,
  description_en, challenge_pl, challenge_en, solution_pl, solution_en,
  result_pl, result_en, seo_title_pl, seo_title_en, seo_desc_pl, seo_desc_en,
  created_at, updated_at)
  ON public.vv_projects TO anon;
GRANT SELECT (project_id, category_id)
  ON public.vv_project_category_assignments TO anon;
GRANT SELECT (id, project_id, name, color, icon, order_index)
  ON public.vv_project_technologies TO anon;
GRANT SELECT (id, project_id, path, type, alt_pl, alt_en, order_index, created_at)
  ON public.vv_project_images TO anon;

GRANT SELECT (id, slug, name_pl, name_en, order_index, created_at)
  ON public.vv_service_categories TO anon;
GRANT SELECT (id, slug, status, featured, order_index, icon, image_url, price,
  price_unit, price_from, duration, title_pl, title_en, short_desc_pl,
  short_desc_en, description_pl, description_en, features_pl, features_en,
  meta_title_pl, meta_title_en, meta_desc_pl, meta_desc_en, created_at, updated_at)
  ON public.vv_services TO anon;
GRANT SELECT (service_id, category_id)
  ON public.vv_service_category_assignments TO anon;

GRANT SELECT (id, slug, status, featured, order_index, category_pl, category_en,
  icon, image_url, title_display, logo_url, title_pl, title_en, short_desc_pl,
  short_desc_en, description_pl, description_en, cta_label_pl, cta_label_en,
  cta_url, release_at, published_at, created_at, updated_at)
  ON public.vv_products TO anon;

GRANT SELECT (id, slug, name_pl, name_en, order_index, is_active, created_at)
  ON public.vv_faq_categories TO anon;
GRANT SELECT (id, category_id, question_pl, question_en, answer_pl, answer_en,
  order_index, is_active, created_at, updated_at)
  ON public.vv_faq_items TO anon;

-- Explicitly keep private operational data unavailable to the anonymous role.
REVOKE ALL ON public.messages, public.vv_newsletter_subscribers,
  public.rate_limit_buckets, public.vv_blog_post_views FROM anon;

COMMIT;
