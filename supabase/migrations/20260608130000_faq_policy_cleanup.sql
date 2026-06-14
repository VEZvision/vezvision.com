-- Remove duplicate public SELECT policies on FAQ tables (prod had public_read + public_select).

DROP POLICY IF EXISTS "vv_faq_items_public_select" ON public.vv_faq_items;
DROP POLICY IF EXISTS "vv_faq_categories_public_select" ON public.vv_faq_categories;

-- Ensure categories schema matches CMS (slug column used by admin panel).
ALTER TABLE public.vv_faq_categories
  ADD COLUMN IF NOT EXISTS slug text;

UPDATE public.vv_faq_categories
SET slug = coalesce(nullif(trim(slug), ''), 'category-' || left(id::text, 8))
WHERE slug IS NULL OR trim(slug) = '';
