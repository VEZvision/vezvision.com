-- MIGRATION TYPE: SEED DATA (historical)
-- Inserts default categories into legacy tables. Current schema uses vv_* tables
-- seeded through the CMS/admin panel. Kept for migration history continuity.
-- Kategorie usług
INSERT INTO public.service_categories (slug, color) VALUES
('web-development', '#3B82F6'),
('mobile-apps', '#10B981'),
('ui-ux-design', '#F59E0B'),
('ecommerce', '#EF4444'),
('consulting', '#8B5CF6'),
('maintenance', '#6B7280');

-- Tłumaczenia kategorii usług
INSERT INTO public.service_category_translations (category_id, language, name, description) VALUES
((SELECT id FROM public.service_categories WHERE slug = 'web-development'), 'pl', 'Tworzenie Stron WWW', 'Profesjonalne strony internetowe i aplikacje webowe'),
((SELECT id FROM public.service_categories WHERE slug = 'web-development'), 'en', 'Web Development', 'Professional websites and web applications'),

((SELECT id FROM public.service_categories WHERE slug = 'mobile-apps'), 'pl', 'Aplikacje Mobilne', 'Aplikacje na iOS i Android'),
((SELECT id FROM public.service_categories WHERE slug = 'mobile-apps'), 'en', 'Mobile Apps', 'iOS and Android applications'),

((SELECT id FROM public.service_categories WHERE slug = 'ui-ux-design'), 'pl', 'UI/UX Design', 'Projektowanie interfejsów i doświadczeń użytkownika'),
((SELECT id FROM public.service_categories WHERE slug = 'ui-ux-design'), 'en', 'UI/UX Design', 'User interface and experience design'),

((SELECT id FROM public.service_categories WHERE slug = 'ecommerce'), 'pl', 'E-commerce', 'Sklepy internetowe i platformy sprzedażowe'),
((SELECT id FROM public.service_categories WHERE slug = 'ecommerce'), 'en', 'E-commerce', 'Online stores and sales platforms'),

((SELECT id FROM public.service_categories WHERE slug = 'consulting'), 'pl', 'Konsulting', 'Doradztwo technologiczne i strategiczne'),
((SELECT id FROM public.service_categories WHERE slug = 'consulting'), 'en', 'Consulting', 'Technology and strategic consulting'),

((SELECT id FROM public.service_categories WHERE slug = 'maintenance'), 'pl', 'Utrzymanie', 'Obsługa i rozwój istniejących systemów'),
((SELECT id FROM public.service_categories WHERE slug = 'maintenance'), 'en', 'Maintenance', 'Support and development of existing systems');

-- Kategorie bloga
INSERT INTO public.blog_categories (slug, color) VALUES
('technology', '#3B82F6'),
('design', '#EC4899'),
('business', '#10B981'),
('tutorials', '#F59E0B'),
('news', '#EF4444'),
('tips', '#8B5CF6');

-- Tłumaczenia kategorii bloga
INSERT INTO public.blog_category_translations (category_id, language, name, description) VALUES
((SELECT id FROM public.blog_categories WHERE slug = 'technology'), 'pl', 'Technologia', 'Najnowsze technologie i trendy'),
((SELECT id FROM public.blog_categories WHERE slug = 'technology'), 'en', 'Technology', 'Latest technologies and trends'),

((SELECT id FROM public.blog_categories WHERE slug = 'design'), 'pl', 'Design', 'Porady i inspiracje projektowe'),
((SELECT id FROM public.blog_categories WHERE slug = 'design'), 'en', 'Design', 'Design tips and inspiration'),

((SELECT id FROM public.blog_categories WHERE slug = 'business'), 'pl', 'Biznes', 'Wskazówki biznesowe i strategie'),
((SELECT id FROM public.blog_categories WHERE slug = 'business'), 'en', 'Business', 'Business tips and strategies'),

((SELECT id FROM public.blog_categories WHERE slug = 'tutorials'), 'pl', 'Poradniki', 'Krok po kroku - samouczki'),
((SELECT id FROM public.blog_categories WHERE slug = 'tutorials'), 'en', 'Tutorials', 'Step by step guides'),

((SELECT id FROM public.blog_categories WHERE slug = 'news'), 'pl', 'Aktualności', 'Najnowsze informacje i nowości'),
((SELECT id FROM public.blog_categories WHERE slug = 'news'), 'en', 'News', 'Latest information and updates'),

((SELECT id FROM public.blog_categories WHERE slug = 'tips'), 'pl', 'Wskazówki', 'Praktyczne wskazówki i triki'),
((SELECT id FROM public.blog_categories WHERE slug = 'tips'), 'en', 'Tips', 'Practical tips and tricks');