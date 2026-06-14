-- Split maintenance allowlist from public settings and hide code injection config.

INSERT INTO public.vv_site_settings (key, value, is_public, description)
SELECT
  'maintenance_allowlist',
  jsonb_build_object(
    'allowedIps',
    COALESCE(
      CASE
        WHEN jsonb_typeof(value->'allowedIps') = 'array' THEN value->'allowedIps'
        ELSE '[]'::jsonb
      END,
      '[]'::jsonb
    )
  ),
  false,
  'Private maintenance IP allowlist (edge function only)'
FROM public.vv_site_settings
WHERE key = 'maintenance_mode'
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  is_public = false,
  description = EXCLUDED.description,
  updated_at = now();

UPDATE public.vv_site_settings
SET
  value = jsonb_build_object(
    'enabled', COALESCE((value->>'enabled')::boolean, false),
    'message', COALESCE(value->>'message', ''),
    'description', COALESCE(value->>'description', '')
  ),
  updated_at = now()
WHERE key = 'maintenance_mode';

UPDATE public.vv_site_settings
SET
  is_public = false,
  description = 'Private CMS head/body snippets (served via get-code-injection edge function)',
  updated_at = now()
WHERE key = 'code_injection';
