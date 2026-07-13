-- MIGRATION TYPE: SEED DATA (historical)
-- Inserts test projects into legacy tables. Current schema uses vv_projects.
-- Kept for migration history continuity only.
-- Insert test portfolio project
INSERT INTO public.projects (
  id, slug, category, status, featured, order_index, demo_url, github_url, client_name, cover_path
) VALUES (
  gen_random_uuid(),
  'test-portfolio-project-1',
  'websites',
  'active',
  true,
  1,
  'https://example.com/demo',
  'https://github.com/test/project',
  'Test Client',
  '/portfolio/test-cover.jpg'
);

-- Insert another test project
WITH inserted_project AS (
  INSERT INTO public.projects (
    id, slug, category, status, featured, order_index, demo_url, github_url, client_name
  ) VALUES (
    gen_random_uuid(),
    'ecommerce-platform-demo',
    'web-apps',
    'active',
    true,
    2,
    'https://example.com/ecommerce-demo',
    'https://github.com/example/ecommerce',
    'Tech Solutions Inc'
  ) RETURNING id
)
INSERT INTO public.project_translations (project_id, locale, title, short_description, description, seo_title, seo_description, seo_keywords)
SELECT 
  id, 
  'pl', 
  'Platforma E-commerce', 
  'Zaawansowana platforma handlu elektronicznego',
  'Stworzyliśmy zaawansowaną platformę e-commerce z funkcjami zarządzania produktami, koszykiem, płatnościami i systemem zamówień.',
  'Platforma E-commerce | Portfolio',
  'Profesjonalna platforma e-commerce z nowoczesnymi funkcjonalnościami.',
  ARRAY['e-commerce', 'platforma', 'sklep internetowy', 'handel elektroniczny']
FROM inserted_project;

WITH inserted_project AS (
  INSERT INTO public.projects (
    id, slug, category, status, featured, order_index, demo_url, github_url, client_name
  ) VALUES (
    gen_random_uuid(),
    'ecommerce-platform-demo',
    'web-apps',
    'active',
    true,
    2,
    'https://example.com/ecommerce-demo',
    'https://github.com/example/ecommerce',
    'Tech Solutions Inc'
  ) RETURNING id
)
INSERT INTO public.project_translations (project_id, locale, title, short_description, description, seo_title, seo_description, seo_keywords)
SELECT 
  id, 
  'en', 
  'E-commerce Platform', 
  'Advanced e-commerce platform',
  'We created an advanced e-commerce platform with product management, shopping cart, payments, and order system features.',
  'E-commerce Platform | Portfolio',
  'Professional e-commerce platform with modern functionalities.',
  ARRAY['e-commerce', 'platform', 'online store', 'electronic commerce']
FROM inserted_project;

-- Insert technologies for the e-commerce project
WITH inserted_project AS (
  SELECT id FROM public.projects WHERE slug = 'ecommerce-platform-demo' LIMIT 1
)
INSERT INTO public.project_technologies (project_id, name, color, icon, "order")
SELECT 
  id,
  'React',
  '#61DAFB',
  'react',
  1
FROM inserted_project
UNION ALL
SELECT 
  id,
  'Node.js',
  '#339933',
  'nodejs',
  2
FROM inserted_project
UNION ALL
SELECT 
  id,
  'PostgreSQL',
  '#336791',
  'postgresql',
  3
FROM inserted_project
UNION ALL
SELECT 
  id,
  'Stripe',
  '#008CDD',
  'stripe',
  4
FROM inserted_project;