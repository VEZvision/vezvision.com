-- MIGRATION TYPE: SEED DATA (historical)
-- Inserts test portfolio projects into legacy tables. Current schema uses vv_projects.
-- Kept for migration history continuity only.
-- Insert test portfolio projects with unique slugs

-- Insert first test project
WITH inserted_project AS (
  INSERT INTO public.projects (
    id, slug, category, status, featured, order_index, demo_url, github_url, client_name
  ) VALUES (
    gen_random_uuid(),
    'modern-portfolio-website-2024',
    'websites',
    'active',
    true,
    1,
    'https://example.com/modern-portfolio',
    'https://github.com/example/modern-portfolio',
    'Creative Agency'
  ) RETURNING id
)
INSERT INTO public.project_translations (project_id, locale, title, short_description, description, seo_title, seo_description, seo_keywords)
SELECT 
  id, 
  'pl', 
  'Nowoczesna Strona Portfolio', 
  'Elegancka i responsywna strona portfolio',
  'Stworzyliśmy nowoczesną, w pełni responsywną stronę portfolio dla Creative Agency. Projekt wyróżnia się czystym designem, intuicyjną nawigacją i optymalizacją pod kątem wyszukiwarek.',
  'Nowoczesna Strona Portfolio | Portfolio',
  'Zobacz nasze portfolio nowoczesnych stron portfolio. Eleganckie designy, responsywne layouty i profesjonalne podejście.',
  ARRAY['strony internetowe', 'design', 'responsywność', 'nowoczesne', 'portfolio']
FROM inserted_project;

-- Insert English translation
WITH inserted_project AS (
  SELECT id FROM public.projects WHERE slug = 'modern-portfolio-website-2024' LIMIT 1
)
INSERT INTO public.project_translations (project_id, locale, title, short_description, description, seo_title, seo_description, seo_keywords)
SELECT 
  id, 
  'en', 
  'Modern Portfolio Website', 
  'Elegant and responsive portfolio website',
  'We created a modern, fully responsive portfolio website for Creative Agency. The project features clean design, intuitive navigation, and search engine optimization.',
  'Modern Portfolio Website | Portfolio',
  'Check out our portfolio of modern portfolio websites. Elegant designs, responsive layouts, and professional approach.',
  ARRAY['websites', 'design', 'responsive', 'modern', 'portfolio']
FROM inserted_project;

-- Insert images and set cover for first project
WITH p AS (
  SELECT id FROM public.projects WHERE slug = 'modern-portfolio-website-2024' LIMIT 1
)
INSERT INTO public.project_images (project_id, path, type, "order", alt_pl, alt_en)
SELECT id, id || '/cover.webp', 'screenshot', 0, 'Okładka', 'Cover' FROM p
UNION ALL
SELECT id, id || '/screen-1.webp', 'screenshot', 1, 'Widok 1', 'Screen 1' FROM p
UNION ALL
SELECT id, id || '/screen-2.webp', 'screenshot', 2, 'Widok 2', 'Screen 2' FROM p;

UPDATE public.projects pr
SET cover_path = p.id || '/cover.webp'
FROM (SELECT id FROM public.projects WHERE slug = 'modern-portfolio-website-2024' LIMIT 1) p
WHERE pr.id = p.id;

-- Insert technologies for the project
WITH inserted_project AS (
  SELECT id FROM public.projects WHERE slug = 'modern-portfolio-website-2024' LIMIT 1
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
  'TypeScript',
  '#3178C6',
  'typescript',
  2
FROM inserted_project
UNION ALL
SELECT 
  id,
  'Tailwind CSS',
  '#38B2AC',
  'tailwind',
  3
FROM inserted_project
UNION ALL
SELECT 
  id,
  'Vite',
  '#646CFF',
  'vite',
  4
FROM inserted_project;

-- Insert second test project
WITH inserted_project AS (
  INSERT INTO public.projects (
    id, slug, category, status, featured, order_index, demo_url, github_url, client_name
  ) VALUES (
    gen_random_uuid(),
    'ecommerce-solution-platform-2024',
    'web-apps',
    'active',
    true,
    2,
    'https://example.com/ecommerce-platform',
    'https://github.com/example/ecommerce-platform',
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

-- Insert images and set cover for second project
WITH p AS (
  SELECT id FROM public.projects WHERE slug = 'ecommerce-solution-platform-2024' LIMIT 1
)
INSERT INTO public.project_images (project_id, path, type, "order", alt_pl, alt_en)
SELECT id, id || '/cover.webp', 'screenshot', 0, 'Okładka', 'Cover' FROM p
UNION ALL
SELECT id, id || '/screen-1.webp', 'screenshot', 1, 'Widok 1', 'Screen 1' FROM p
UNION ALL
SELECT id, id || '/screen-2.webp', 'screenshot', 2, 'Widok 2', 'Screen 2' FROM p;

UPDATE public.projects pr
SET cover_path = p.id || '/cover.webp'
FROM (SELECT id FROM public.projects WHERE slug = 'ecommerce-solution-platform-2024' LIMIT 1) p
WHERE pr.id = p.id;

-- Insert English translation for second project
WITH inserted_project AS (
  SELECT id FROM public.projects WHERE slug = 'ecommerce-solution-platform-2024' LIMIT 1
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
  SELECT id FROM public.projects WHERE slug = 'ecommerce-solution-platform-2024' LIMIT 1
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
