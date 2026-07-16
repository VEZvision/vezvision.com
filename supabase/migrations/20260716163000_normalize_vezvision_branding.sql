UPDATE public.vv_page_seo
SET
  title_pl = replace(title_pl, 'VezVision', 'VEZvision'),
  title_en = replace(title_en, 'VezVision', 'VEZvision'),
  description_pl = replace(description_pl, 'VezVision', 'VEZvision'),
  description_en = replace(description_en, 'VezVision', 'VEZvision'),
  og_title_pl = replace(og_title_pl, 'VezVision', 'VEZvision'),
  og_title_en = replace(og_title_en, 'VezVision', 'VEZvision'),
  og_description_pl = replace(og_description_pl, 'VezVision', 'VEZvision'),
  og_description_en = replace(og_description_en, 'VezVision', 'VEZvision')
WHERE concat_ws(
  ' ', title_pl, title_en, description_pl, description_en,
  og_title_pl, og_title_en, og_description_pl, og_description_en
) LIKE '%VezVision%';

UPDATE public.vv_site_settings
SET value = replace(value::text, 'VezVision', 'VEZvision')::jsonb
WHERE key IN ('site_identity', 'seo')
  AND value::text LIKE '%VezVision%';
