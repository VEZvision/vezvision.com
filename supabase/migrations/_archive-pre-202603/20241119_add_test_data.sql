-- MIGRATION TYPE: SEED DATA (historical)
-- This migration inserts test/demo data for legacy tables that no longer exist
-- in the current schema. It is kept only for migration history continuity.
-- Add some test data for verification
-- This will help test if the admin panel is working correctly

-- Insert a simple test project if none exist
INSERT INTO public.projects (
  id, slug, category, status, featured, order_index, demo_url, github_url, client_name
) VALUES (
  gen_random_uuid(),
  'test-project-2024',
  'websites',
  'active',
  false,
  999,
  'https://example.com/test',
  'https://github.com/example/test',
  'Test Client'
) ON CONFLICT DO NOTHING;

-- Add translations for the test project
INSERT INTO public.project_translations (project_id, locale, title, short_description, description)
SELECT 
  id, 
  'pl', 
  'Projekt Testowy', 
  'To jest projekt testowy do weryfikacji panelu admina',
  'Szczegółowy opis projektu testowego do weryfikacji funkcjonalności panelu administracyjnego.'
FROM public.projects WHERE slug = 'test-project-2024'
ON CONFLICT DO NOTHING;

INSERT INTO public.project_translations (project_id, locale, title, short_description, description)
SELECT 
  id, 
  'en', 
  'Test Project', 
  'This is a test project to verify the admin panel',
  'Detailed description of the test project to verify admin panel functionality.'
FROM public.projects WHERE slug = 'test-project-2024'
ON CONFLICT DO NOTHING;

-- Add a test technology
INSERT INTO public.project_technologies (project_id, name, color, icon, "order")
SELECT 
  id, 
  'React', 
  '#61DAFB', 
  'react',
  0
FROM public.projects WHERE slug = 'test-project-2024'
ON CONFLICT DO NOTHING;