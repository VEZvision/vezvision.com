-- Insert sample images for test projects using public URLs

-- Modern Portfolio Website
WITH p AS (
  SELECT id FROM public.projects WHERE slug = 'modern-portfolio-website-2024' LIMIT 1
)
INSERT INTO public.project_images (project_id, path, type, "order", alt_pl, alt_en)
SELECT id, 'https://picsum.photos/seed/modern-portfolio-1/1200/675', 'screenshot', 0, 'Podgląd strony głównej', 'Homepage preview' FROM p
UNION ALL
SELECT id, 'https://picsum.photos/seed/modern-portfolio-2/1200/675', 'screenshot', 1, 'Podgląd sekcji', 'Section preview' FROM p;

-- E-commerce Platform
WITH p AS (
  SELECT id FROM public.projects WHERE slug = 'ecommerce-solution-platform-2024' LIMIT 1
)
INSERT INTO public.project_images (project_id, path, type, "order", alt_pl, alt_en)
SELECT id, 'https://picsum.photos/seed/ecommerce-1/1200/675', 'screenshot', 0, 'Panel sklepu', 'Shop panel' FROM p
UNION ALL
SELECT id, 'https://picsum.photos/seed/ecommerce-2/1200/675', 'screenshot', 1, 'Strona produktu', 'Product page' FROM p;
