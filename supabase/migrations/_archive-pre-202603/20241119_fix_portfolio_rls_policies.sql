-- Drop existing complex RLS policies
DROP POLICY IF EXISTS "Public can view active projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can manage projects" ON public.projects;

DROP POLICY IF EXISTS "Public can view translations for active projects" ON public.project_translations;
DROP POLICY IF EXISTS "Admin can manage translations" ON public.project_translations;

DROP POLICY IF EXISTS "Public can view images for active projects" ON public.project_images;
DROP POLICY IF EXISTS "Admin can manage images" ON public.project_images;

DROP POLICY IF EXISTS "Public can view technologies for active projects" ON public.project_technologies;
DROP POLICY IF EXISTS "Admin can manage technologies" ON public.project_technologies;

-- Create simplified RLS policies based on admin authentication
-- Allow public read access to active projects
CREATE POLICY "Public can view active projects" ON public.projects FOR SELECT
  USING (status = 'active');

-- Admins can view all projects (including non-active) - check by email or username
CREATE POLICY "Admin can view all projects" ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
      AND admins.is_active = true
    )
  );

-- Allow admin users to manage all projects
CREATE POLICY "Admin can manage projects" ON public.projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
      AND admins.is_active = true
    )
  );

-- Allow public read access to translations of active projects
CREATE POLICY "Public can view translations for active projects" ON public.project_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_translations.project_id AND projects.status = 'active'
    )
  );

-- Allow admin users to manage all translations
CREATE POLICY "Admin can manage translations" ON public.project_translations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
      AND admins.is_active = true
    )
  );

-- Allow public read access to images of active projects
CREATE POLICY "Public can view images for active projects" ON public.project_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_images.project_id AND projects.status = 'active'
    )
  );

-- Allow admin users to manage all images
CREATE POLICY "Admin can manage images" ON public.project_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
      AND admins.is_active = true
    )
  );

-- Allow public read access to technologies of active projects
CREATE POLICY "Public can view technologies for active projects" ON public.project_technologies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_technologies.project_id AND projects.status = 'active'
    )
  );

-- Allow admin users to manage all technologies
CREATE POLICY "Admin can manage technologies" ON public.project_technologies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
      AND admins.is_active = true
    )
  );

-- Simplify storage policies for 'portfolio' bucket
DROP POLICY IF EXISTS "Authenticated can manage portfolio files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage portfolio files" ON storage.objects;

CREATE POLICY "Admin can manage portfolio files" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'portfolio' AND EXISTS (
      SELECT 1 FROM public.admins
      WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    bucket_id = 'portfolio' AND EXISTS (
      SELECT 1 FROM public.admins
      WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
      AND admins.is_active = true
    )
  );