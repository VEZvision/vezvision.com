-- FAQ items for public site (types existed; table migration was missing from repo).

CREATE TABLE IF NOT EXISTS public.vv_faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text,
  name_pl text NOT NULL,
  name_en text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE TABLE IF NOT EXISTS public.vv_faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.vv_faq_categories(id) ON DELETE SET NULL,
  question_pl text NOT NULL,
  question_en text,
  answer_pl text NOT NULL,
  answer_en text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vv_faq_items_active_order
  ON public.vv_faq_items (is_active, order_index)
  WHERE is_active = true;

ALTER TABLE public.vv_faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_faq_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vv_faq_items_public_read" ON public.vv_faq_items;
CREATE POLICY "vv_faq_items_public_read" ON public.vv_faq_items
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "vv_faq_categories_public_read" ON public.vv_faq_categories;
CREATE POLICY "vv_faq_categories_public_read" ON public.vv_faq_categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true);
