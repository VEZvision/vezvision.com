-- Funkcja do sprawdzania czy użytkownik jest adminem
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admins 
    WHERE (email = auth.email() OR username = auth.email()) 
    AND is_active = true
  );
END;
$$;

-- Uprawnienia dla funkcji
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon, authenticated;

-- Aktualizacja RLS policies dla tabeli projects
DROP POLICY IF EXISTS "Admin can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;

CREATE POLICY "Admin can manage projects" ON public.projects FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT
USING (status = 'published');

-- Aktualizacja RLS policies dla tabeli project_translations
DROP POLICY IF EXISTS "Admin can manage project translations" ON public.project_translations;
DROP POLICY IF EXISTS "Public can view project translations" ON public.project_translations;

CREATE POLICY "Admin can manage project translations" ON public.project_translations FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view project translations" ON public.project_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_translations.project_id 
    AND projects.status = 'published'
  )
);

-- Aktualizacja RLS policies dla tabeli project_images
DROP POLICY IF EXISTS "Admin can manage project images" ON public.project_images;
DROP POLICY IF EXISTS "Public can view project images" ON public.project_images;

CREATE POLICY "Admin can manage project images" ON public.project_images FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view project images" ON public.project_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_images.project_id 
    AND projects.status = 'published'
  )
);

-- Aktualizacja RLS policies dla tabeli project_technologies
DROP POLICY IF EXISTS "Admin can manage project technologies" ON public.project_technologies;
DROP POLICY IF EXISTS "Public can view project technologies" ON public.project_technologies;

CREATE POLICY "Admin can manage project technologies" ON public.project_technologies FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view project technologies" ON public.project_technologies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_technologies.project_id 
    AND projects.status = 'published'
  )
);