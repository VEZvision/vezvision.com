INSERT INTO public.vv_site_settings (key, value, is_public, description)
VALUES
  (
    'navigation',
    jsonb_build_object(
      'items', jsonb_build_array(
        jsonb_build_object('id', 'about', 'href', '/about', 'labelPl', 'O nas', 'labelEn', 'About', 'enabled', true),
        jsonb_build_object('id', 'services', 'href', '/services', 'labelPl', 'Usługi', 'labelEn', 'Services', 'enabled', true),
        jsonb_build_object('id', 'portfolio', 'href', '/portfolio', 'labelPl', 'Portfolio', 'labelEn', 'Portfolio', 'enabled', true),
        jsonb_build_object('id', 'blog', 'href', '/blog', 'labelPl', 'Blog', 'labelEn', 'Blog', 'enabled', true),
        jsonb_build_object('id', 'products', 'href', '/products', 'labelPl', 'Produkty', 'labelEn', 'Products', 'enabled', true)
      ),
      'contactButtonLabelPl', 'Kontakt',
      'contactButtonLabelEn', 'Contact',
      'contactButtonHref', '/contact'
    ),
    true,
    'Primary public navigation settings'
  ),
  (
    'footer',
    jsonb_build_object(
      'subtitlePl', 'Nowa jakość cyfrowego rozwoju — rozwiązania, które napędzają marki i liderów jutra.',
      'subtitleEn', 'A new quality of digital growth — solutions that empower brands and tomorrow''s leaders.',
      'taglinePl', 'Biznes, technologia, kreatywność — w jednym miejscu.',
      'taglineEn', 'Business, technology, creativity — in one place.',
      'ctaLabelPl', 'Zacznij współpracę',
      'ctaLabelEn', 'Start cooperation',
      'ctaHref', '/contact',
      'legalLinks', jsonb_build_array(
        jsonb_build_object('id', 'privacy', 'href', '/privacy-policy', 'labelPl', 'Polityka Prywatności', 'labelEn', 'Privacy Policy', 'enabled', true),
        jsonb_build_object('id', 'terms', 'href', '/terms', 'labelPl', 'Regulamin', 'labelEn', 'Terms', 'enabled', true),
        jsonb_build_object('id', 'cookies', 'href', '/cookie-policy', 'labelPl', 'Cookies', 'labelEn', 'Cookies', 'enabled', true)
      )
    ),
    true,
    'Footer copy, CTA and legal links'
  )
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  is_public = EXCLUDED.is_public,
  description = EXCLUDED.description;
