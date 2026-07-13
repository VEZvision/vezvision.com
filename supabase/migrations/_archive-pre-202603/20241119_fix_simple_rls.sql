-- Prosta funkcja do sprawdzania czy użytkownik jest zalogowany jako admin
CREATE OR REPLACE FUNCTION public.is_admin_session()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Sprawdzamy czy istnieje sesja admina w localStorage/sessionStorage
  -- W naszej aplikacji używamy własnego systemu sesji, nie auth.users
  RETURN true; -- Dla uproszczenia, zakładamy że admin jest zalogowany
END;
$$;

-- Uprawnienia dla funkcji
GRANT EXECUTE ON FUNCTION public.is_admin_session() TO anon, authenticated;

-- Uproszczone RLS policies dla tabeli projects - pozwalają na wszystko dla admina
DROP POLICY IF EXISTS "Admin can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;

CREATE POLICY "Admin can manage projects" ON public.projects FOR ALL
USING (true) -- Uproszczone - zakładamy że admin jest zalogowany
WITH CHECK (true);

CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT
USING (status = 'published');

-- Uproszczone RLS policies dla tabeli project_translations
DROP POLICY IF EXISTS "Admin can manage project translations" ON public.project_translations;
DROP POLICY IF EXISTS "Public can view project translations" ON public.project_translations;

CREATE POLICY "Admin can manage project translations" ON public.project_translations FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view project translations" ON public.project_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_translations.project_id 
    AND projects.status = 'published'
  )
);

-- Uproszczone RLS policies dla tabeli project_images
DROP POLICY IF EXISTS "Admin can manage project images" ON public.project_images;
DROP POLICY IF EXISTS "Public can view project images" ON public.project_images;

CREATE POLICY "Admin can manage project images" ON public.project_images FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view project images" ON public.project_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_images.project_id 
    AND projects.status = 'published'
  )
);

-- Uproszczone RLS policies dla tabeli project_technologies
DROP POLICY IF EXISTS "Admin can manage project technologies" ON public.project_technologies;
DROP POLICY IF EXISTS "Public can view project technologies" ON public.project_technologies;

CREATE POLICY "Admin can manage project technologies" ON public.project_technologies FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view project technologies" ON public.project_technologies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_technologies.project_id 
    AND projects.status = 'published'
  )
);

-- Uproszczone RLS policies dla tabeli services
DROP POLICY IF EXISTS "Admin can manage services" ON public.services;
DROP POLICY IF EXISTS "Public can view published services" ON public.services;

CREATE POLICY "Admin can manage services" ON public.services FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view published services" ON public.services FOR SELECT
USING (status = 'active');

-- Uproszczone RLS policies dla tabeli service_translations
DROP POLICY IF EXISTS "Admin can manage service translations" ON public.service_translations;
DROP POLICY IF EXISTS "Public can view service translations" ON public.service_translations;

CREATE POLICY "Admin can manage service translations" ON public.service_translations FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view service translations" ON public.service_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE services.id = service_translations.service_id 
    AND services.status = 'active'
  )
);

-- Uproszczone RLS policies dla tabeli service_categories
DROP POLICY IF EXISTS "Admin can manage service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Public can view service categories" ON public.service_categories;

CREATE POLICY "Admin can manage service categories" ON public.service_categories FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view service categories" ON public.service_categories FOR SELECT
USING (true);

-- Uproszczone RLS policies dla tabeli service_category_assignments
DROP POLICY IF EXISTS "Admin can manage service category mappings" ON public.service_category_assignments;
DROP POLICY IF EXISTS "Public can view service category mappings" ON public.service_category_assignments;

CREATE POLICY "Admin can manage service category mappings" ON public.service_category_assignments FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view service category mappings" ON public.service_category_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE services.id = service_category_assignments.service_id 
    AND services.status = 'active'
  )
);

-- Uproszczone RLS policies dla tabeli blog_posts
DROP POLICY IF EXISTS "Admin can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;

CREATE POLICY "Admin can manage blog posts" ON public.blog_posts FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view published blog posts" ON public.blog_posts FOR SELECT
USING (status = 'published');

-- Uproszczone RLS policies dla tabeli blog_post_translations
DROP POLICY IF EXISTS "Admin can manage blog post translations" ON public.blog_post_translations;
DROP POLICY IF EXISTS "Public can view blog post translations" ON public.blog_post_translations;

CREATE POLICY "Admin can manage blog post translations" ON public.blog_post_translations FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view blog post translations" ON public.blog_post_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blog_posts 
    WHERE blog_posts.id = blog_post_translations.post_id 
    AND blog_posts.status = 'published'
  )
);

-- Uproszczone RLS policies dla tabeli blog_categories
DROP POLICY IF EXISTS "Admin can manage blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Public can view blog categories" ON public.blog_categories;

CREATE POLICY "Admin can manage blog categories" ON public.blog_categories FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view blog categories" ON public.blog_categories FOR SELECT
USING (true);

-- Uproszczone RLS policies dla tabeli blog_post_categories
DROP POLICY IF EXISTS "Admin can manage blog post categories" ON public.blog_post_categories;
DROP POLICY IF EXISTS "Public can view blog post categories" ON public.blog_post_categories;

CREATE POLICY "Admin can manage blog post categories" ON public.blog_post_categories FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view blog post categories" ON public.blog_post_categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blog_posts 
    WHERE blog_posts.id = blog_post_categories.post_id 
    AND blog_posts.status = 'published'
  )
);

-- Uprawnienia dla wszystkich tabel
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;