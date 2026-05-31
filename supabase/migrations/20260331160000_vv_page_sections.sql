CREATE TABLE IF NOT EXISTS public.vv_page_sections (
  page_key     TEXT NOT NULL,
  section_key  TEXT NOT NULL,
  order_index  INTEGER NOT NULL DEFAULT 0,
  enabled      BOOLEAN NOT NULL DEFAULT true,
  content_pl   JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_en   JSONB NOT NULL DEFAULT '{}'::jsonb,
  config       JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (page_key, section_key)
);

CREATE TRIGGER vv_page_sections_updated_at
  BEFORE UPDATE ON public.vv_page_sections
  FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();

ALTER TABLE public.vv_page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vv_page_sections_public_read" ON public.vv_page_sections
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "vv_page_sections_admin_all" ON public.vv_page_sections
  FOR ALL TO authenticated
  USING (vv_is_admin())
  WITH CHECK (vv_is_admin());

GRANT SELECT ON public.vv_page_sections TO anon;

INSERT INTO public.vv_page_sections (page_key, section_key, order_index, enabled, content_pl, content_en, config, is_public)
VALUES
  ('home', 'hero', 1, true, '{}'::jsonb, '{}'::jsonb, jsonb_build_object('primaryHref', '/contact', 'secondaryHref', '/services'), true),
  ('home', 'founder_note', 2, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('home', 'benefits', 3, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('home', 'features', 4, true, '{}'::jsonb, '{}'::jsonb, jsonb_build_object('primaryHref', '/contact', 'secondaryHref', '/services'), true),
  ('home', 'potential', 5, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('home', 'process', 6, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('home', 'about_comparison', 7, true, '{}'::jsonb, '{}'::jsonb, jsonb_build_object('contactHref', '/contact#kontakt'), true),
  ('home', 'products_teaser', 8, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('home', 'newsletter', 9, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('home', 'contact', 10, true, '{}'::jsonb, '{}'::jsonb, jsonb_build_object('meetingHref', '/contact'), true),
  ('about', 'hero', 1, true, '{}'::jsonb, '{}'::jsonb, jsonb_build_object('contactHref', '/contact#kontakt'), true),
  ('about', 'header', 2, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('about', 'cards', 3, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('about', 'values', 4, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('about', 'about_comparison', 5, true, '{}'::jsonb, '{}'::jsonb, jsonb_build_object('contactHref', '/contact#kontakt'), true),
  ('about', 'why_choose', 6, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('about', 'faq', 7, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('about', 'contact', 8, true, '{}'::jsonb, '{}'::jsonb, jsonb_build_object('meetingHref', '/contact'), true),
  ('contact', 'hero', 1, true, '{}'::jsonb, '{}'::jsonb, jsonb_build_object('formTargetId', 'contact-form-section'), true),
  ('contact', 'form', 2, true, jsonb_build_object('contact.form.label.phoneOptional', 'Numer telefonu (Opcjonalnie)', 'contact.form.consent', 'Wyrażam zgodę na przetwarzanie moich danych osobowych w celu obsługi zapytania. Administratorem danych jest VezVision. Szczegóły w Polityce Prywatności.'), jsonb_build_object('contact.form.label.phoneOptional', 'Phone number (optional)', 'contact.form.consent', 'I consent to the processing of my personal data for the purpose of handling this inquiry. The controller is VezVision. Details are available in the Privacy Policy.'), '{}'::jsonb, true),
  ('contact', 'faq', 3, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, true),
  ('contact', 'contact', 4, true, '{}'::jsonb, '{}'::jsonb, jsonb_build_object('meetingHref', '/contact'), true)
ON CONFLICT (page_key, section_key) DO UPDATE
SET
  order_index = EXCLUDED.order_index,
  enabled = EXCLUDED.enabled,
  content_pl = EXCLUDED.content_pl,
  content_en = EXCLUDED.content_en,
  config = EXCLUDED.config,
  is_public = EXCLUDED.is_public;
