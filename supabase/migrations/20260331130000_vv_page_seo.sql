CREATE TABLE IF NOT EXISTS public.vv_page_seo (
  page_key            TEXT PRIMARY KEY,
  title_pl            TEXT NOT NULL,
  title_en            TEXT NOT NULL,
  description_pl      TEXT NOT NULL,
  description_en      TEXT NOT NULL,
  og_title_pl         TEXT NOT NULL DEFAULT '',
  og_title_en         TEXT NOT NULL DEFAULT '',
  og_description_pl   TEXT NOT NULL DEFAULT '',
  og_description_en   TEXT NOT NULL DEFAULT '',
  og_image_url        TEXT NOT NULL DEFAULT '',
  canonical_url       TEXT NOT NULL DEFAULT '',
  robots              TEXT NOT NULL DEFAULT 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1',
  indexable           BOOLEAN NOT NULL DEFAULT true,
  structured_data_json TEXT NOT NULL DEFAULT '',
  is_public           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER vv_page_seo_updated_at
  BEFORE UPDATE ON public.vv_page_seo
  FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();

ALTER TABLE public.vv_page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vv_page_seo_public_read" ON public.vv_page_seo
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "vv_page_seo_admin_all" ON public.vv_page_seo
  FOR ALL TO authenticated
  USING (vv_is_admin())
  WITH CHECK (vv_is_admin());

GRANT SELECT ON public.vv_page_seo TO anon;

INSERT INTO public.vv_page_seo (
  page_key,
  title_pl,
  title_en,
  description_pl,
  description_en,
  og_title_pl,
  og_title_en,
  og_description_pl,
  og_description_en,
  canonical_url,
  indexable,
  is_public
)
VALUES
  ('home', 'VEZvision - Nowoczesne Strony i Aplikacje Internetowe', 'VEZvision - Modern Websites and Web Applications', 'Projektujemy strony internetowe, aplikacje webowe i rozwiązania cyfrowe dopasowane do realnych potrzeb firm.', 'We design websites, web applications and digital solutions matched to real business needs.', '', '', '', '', '', true, true),
  ('about', 'O nas - VEZvision', 'About Us - VEZvision', 'Poznaj VEZvision i zobacz, jak pracujemy nad stronami, aplikacjami, automatyzacjami i narzędziami dla firm.', 'Meet VEZvision and see how we work on websites, applications, automations and business tools.', '', '', '', '', '', true, true),
  ('services', 'Usługi - VEZvision', 'Services - VEZvision', 'Sprawdź usługi VEZvision: strony internetowe, aplikacje webowe, e-commerce, automatyzacje i systemy dla firm.', 'Explore VEZvision services: websites, web applications, e-commerce, automations and business systems.', '', '', '', '', '', true, true),
  ('portfolio', 'Portfolio - VEZvision', 'Portfolio - VEZvision', 'Zobacz, jak VEZvision dokumentuje kontekst, proces projektowy i efekty przygotowywanych realizacji.', 'See how VEZvision documents the context, design process and outcomes of upcoming projects.', '', '', '', '', '', true, true),
  ('blog', 'Blog - VEZvision', 'Blog - VEZvision', 'Praktyczne materiały VEZvision o technologii, projektowaniu i rozwoju cyfrowym firm.', 'Practical VEZvision notes about technology, design and digital business growth.', '', '', '', '', '', true, true),
  ('products', 'Produkty - VEZvision', 'Products - VEZvision', 'Poznaj rozwijane przez VEZvision produkty cyfrowe i narzędzia wspierające codzienną pracę.', 'Discover digital products and tools being developed by VEZvision for everyday work.', '', '', '', '', '', true, true),
  ('contact', 'Kontakt - VEZvision', 'Contact - VEZvision', 'Skontaktuj się z VEZvision i opowiedz nam o swoim projekcie lub wyzwaniu biznesowym.', 'Contact VEZvision and tell us about your project or business challenge.', '', '', '', '', '', true, true),
  ('privacy-policy', 'Polityka prywatności - VEZvision', 'Privacy Policy - VEZvision', 'Sprawdź, jak VEZvision przetwarza dane osobowe i realizuje prawa użytkowników.', 'Learn how VEZvision processes personal data and supports user privacy rights.', '', '', '', '', '', true, true),
  ('terms', 'Regulamin - VEZvision', 'Terms of Service - VEZvision', 'Przeczytaj zasady korzystania ze strony internetowej VEZvision.', 'Read the terms that apply to using the VEZvision website.', '', '', '', '', '', true, true),
  ('cookie-policy', 'Polityka cookies - VEZvision', 'Cookie Policy - VEZvision', 'Dowiedz się, jak VEZvision używa plików cookies i ustawień zgód.', 'Learn how VEZvision uses cookies and consent preferences.', '', '', '', '', '', true, true),
  ('unsubscribe', 'Rezygnacja z newslettera - VEZvision', 'Unsubscribe from newsletter - VEZvision', 'Zarządzaj subskrypcją newslettera VEZvision.', 'Manage your VEZvision newsletter subscription.', '', '', '', '', '', true, true),
  ('not-found', 'Nie znaleziono strony - VEZvision', 'Page not found - VEZvision', 'Strona, której szukasz, nie istnieje lub została przeniesiona.', 'The page you are looking for does not exist or has been moved.', '', '', '', '', '', false, true)
ON CONFLICT (page_key) DO UPDATE
SET
  title_pl = EXCLUDED.title_pl,
  title_en = EXCLUDED.title_en,
  description_pl = EXCLUDED.description_pl,
  description_en = EXCLUDED.description_en,
  og_title_pl = EXCLUDED.og_title_pl,
  og_title_en = EXCLUDED.og_title_en,
  og_description_pl = EXCLUDED.og_description_pl,
  og_description_en = EXCLUDED.og_description_en,
  canonical_url = EXCLUDED.canonical_url,
  indexable = EXCLUDED.indexable,
  is_public = EXCLUDED.is_public;
