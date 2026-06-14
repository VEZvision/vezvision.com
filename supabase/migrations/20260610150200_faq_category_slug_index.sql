CREATE UNIQUE INDEX IF NOT EXISTS vv_faq_categories_slug_key
  ON public.vv_faq_categories (slug)
  WHERE slug IS NOT NULL AND slug <> '';

CREATE INDEX IF NOT EXISTS vv_faq_items_category_id_idx
  ON public.vv_faq_items (category_id)
  WHERE is_active = true;
