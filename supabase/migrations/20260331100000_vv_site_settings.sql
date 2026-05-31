CREATE TABLE IF NOT EXISTS public.vv_site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public   BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER vv_site_settings_updated_at
  BEFORE UPDATE ON public.vv_site_settings
  FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();

ALTER TABLE public.vv_site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vv_site_settings_public_read" ON public.vv_site_settings
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "vv_site_settings_admin_all" ON public.vv_site_settings
  FOR ALL TO authenticated
  USING (vv_is_admin())
  WITH CHECK (vv_is_admin());

GRANT SELECT ON public.vv_site_settings TO anon;

INSERT INTO public.vv_site_settings (key, value, is_public, description)
VALUES
  (
    'site_identity',
    jsonb_build_object(
      'siteName', 'VezVision',
      'logoUrl', '',
      'faviconUrl', '',
      'defaultOgImageUrl', ''
    ),
    true,
    'Public brand identity settings'
  ),
  (
    'contact',
    jsonb_build_object(
      'email', 'contact@vezvision.com',
      'phone', '+48 572 711 535',
      'address', 'Złote Łany 11, Bielsko-Biała',
      'addressLine1', 'Złote Łany 11',
      'city', 'Bielsko-Biała',
      'postalCode', '',
      'country', 'Poland'
    ),
    true,
    'Public contact settings'
  ),
  (
    'social',
    jsonb_build_object(
      'facebook', '',
      'instagram', '',
      'linkedin', '',
      'github', '',
      'x', ''
    ),
    true,
    'Public social media links'
  ),
  (
    'seo',
    jsonb_build_object(
      'siteTitle', 'VezVision',
      'siteDescription', 'VezVision - modern websites, web applications and digital solutions for growing businesses.',
      'keywords', jsonb_build_array(),
      'siteUrl', 'https://vezvision.com',
      'robots', 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1',
      'ogSiteName', 'VezVision'
    ),
    true,
    'Global public SEO settings'
  ),
  (
    'maintenance_mode',
    jsonb_build_object(
      'enabled', false,
      'message', 'Przerwa techniczna',
      'description', 'Przepraszamy za utrudnienia. Nasza strona przechodzi właśnie zaplanowane prace konserwacyjne. Wrócimy już wkrótce!',
      'allowedIps', jsonb_build_array()
    ),
    true,
    'Public maintenance mode settings'
  ),
  (
    'code_injection',
    jsonb_build_object(
      'head', '',
      'body', ''
    ),
    true,
    'Public code injection snippets'
  ),
  (
    'seo_files',
    jsonb_build_object(
      'robotsTxt', '',
      'sitemapXml', ''
    ),
    true,
    'SEO files content'
  ),
  (
    'company',
    jsonb_build_object(
      'legalName', 'POLIFORM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ',
      'krs', '0000831630',
      'nip', '5472217672',
      'regon', '385670222'
    ),
    true,
    'Public company identity data'
  )
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  is_public = EXCLUDED.is_public,
  description = EXCLUDED.description;
