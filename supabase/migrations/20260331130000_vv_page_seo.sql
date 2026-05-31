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
  ('home', 'VezVision - Nowoczesne Strony i Aplikacje Internetowe', 'VezVision - Modern Websites and Web Applications', 'Tworzymy innowacyjne strony internetowe, aplikacje webowe i rozwiązania cyfrowe, które pomagają firmom rosnąć. Sprawdź naszą ofertę!', 'We create innovative websites, web applications, and digital solutions that help businesses grow. Check our offer!', '', '', '', '', '', true, true),
  ('about', 'O nas - VezVision', 'About Us - VezVision', 'Poznaj zespół VezVision. Jesteśmy pasjonatami technologii, którzy tworzą rozwiązania przyszłości.', 'Meet the VezVision team. We are technology enthusiasts creating solutions for the future.', '', '', '', '', '', true, true),
  ('services', 'Usługi - VezVision', 'Services - VezVision', 'Kompleksowe usługi programistyczne: strony WWW, aplikacje webowe, sklepy internetowe, automatyzacja procesów. Zobacz co możemy dla Ciebie zrobić.', 'Comprehensive development services: websites, web apps, e-commerce, process automation. See what we can do for you.', '', '', '', '', '', true, true),
  ('portfolio', 'Portfolio - VezVision', 'Portfolio - VezVision', 'Zobacz nasze realizacje. Projekty, z których jesteśmy dumni - od stron wizytówek po zaawansowane systemy webowe.', 'See our work. Projects we are proud of - from landing pages to advanced web systems.', '', '', '', '', '', true, true),
  ('blog', 'Blog - VezVision', 'Blog - VezVision', 'Artykuły o technologii, marketingu i biznesie w sieci. Dzielimy się wiedzą i doświadczeniem.', 'Articles about technology, marketing, and online business. We share knowledge and experience.', '', '', '', '', '', true, true),
  ('products', 'Produkty - VezVision', 'Products - VezVision', 'Odkryj nasze produkty cyfrowe i narzędzia, które usprawnią Twoją pracę i biznes.', 'Discover our digital products and tools that will streamline your work and business.', '', '', '', '', '', true, true),
  ('contact', 'Kontakt - VezVision', 'Contact - VezVision', 'Skontaktuj się z nami. Porozmawiajmy o Twoim projekcie i znajdźmy najlepsze rozwiązanie dla Twojego biznesu.', 'Contact us. Let''s talk about your project and find the best solution for your business.', '', '', '', '', '', true, true),
  ('privacy-policy', 'Polityka Prywatności - VezVision', 'Privacy Policy - VezVision', 'Polityka prywatności VezVision – informacje o administratorze danych, podstawach prawnych, prawach użytkownika i odbiorcach danych.', 'VezVision privacy policy – information about data controller, legal basis, user rights and data recipients.', '', '', '', '', '', true, true),
  ('terms', 'Regulamin - VezVision', 'Terms of Service - VezVision', 'Regulamin świadczenia usług drogą elektroniczną VezVision.', 'VezVision Terms of Service.', '', '', '', '', '', true, true),
  ('cookie-policy', 'Polityka plików cookie - VezVision', 'Cookie Policy - VezVision', 'Polityka plików cookie VezVision – informacje o rodzajach cookies, podstawach prawnych i sposobach zarządzania zgodami.', 'VezVision cookie policy – information about cookie types, legal basis and how to manage your preferences.', '', '', '', '', '', true, true),
  ('unsubscribe', 'Rezygnacja z newslettera - VezVision', 'Unsubscribe from newsletter - VezVision', 'Zarządzaj subskrypcją newslettera VezVision – wypisz się za pomocą linku lub adresu e-mail.', 'Manage your VezVision newsletter subscription – unsubscribe using a link or your email address.', '', '', '', '', '', true, true),
  ('not-found', 'Strona nie została znaleziona - VezVision', 'Page not found - VezVision', 'Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona.', 'Sorry, the page you are looking for does not exist or has been moved.', '', '', '', '', '', false, true)
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
