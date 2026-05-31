-- Fix portfolio permissions for anon and authenticated roles

-- Grant basic permissions to anon role for reading
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.project_translations TO anon;
GRANT SELECT ON public.project_images TO anon;
GRANT SELECT ON public.project_technologies TO anon;

-- Grant full permissions to authenticated role
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.project_translations TO authenticated;
GRANT ALL ON public.project_images TO authenticated;
GRANT ALL ON public.project_technologies TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;

-- Update RLS policies to work properly with anon role
-- Drop existing policies that reference non-existent admins table structure
DROP POLICY IF EXISTS "Public can view active projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can delete projects" ON public.projects;

DROP POLICY IF EXISTS "Public can view translations for active projects" ON public.project_translations;
DROP POLICY IF EXISTS "Admin can manage translations" ON public.project_translations;

DROP POLICY IF EXISTS "Public can view images for active projects" ON public.project_images;
DROP POLICY IF EXISTS "Admin can manage images" ON public.project_images;

DROP POLICY IF EXISTS "Public can view technologies for active projects" ON public.project_technologies;
DROP POLICY IF EXISTS "Admin can manage technologies" ON public.project_technologies;

-- Create new simplified policies that work with anon role
CREATE POLICY "Public can view active projects" ON public.projects FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public can view translations for active projects" ON public.project_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_translations.project_id AND projects.status = 'active'
    )
  );

CREATE POLICY "Public can view images for active projects" ON public.project_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_images.project_id AND projects.status = 'active'
    )
  );

CREATE POLICY "Public can view technologies for active projects" ON public.project_technologies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_technologies.project_id AND projects.status = 'active'
    )
  );

-- Create admin policies (these will work with the existing admins table)
CREATE POLICY "Admin can view all projects" ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.username = auth.jwt() ->> 'email' AND admins.is_active = true
    )
  );

CREATE POLICY "Admin can manage projects" ON public.projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.username = auth.jwt() ->> 'email' AND admins.is_active = true
    )
  );

CREATE POLICY "Admin can manage translations" ON public.project_translations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.username = auth.jwt() ->> 'email' AND admins.is_active = true
    )
  );

CREATE POLICY "Admin can manage images" ON public.project_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.username = auth.jwt() ->> 'email' AND admins.is_active = true
    )
  );

CREATE POLICY "Admin can manage technologies" ON public.project_technologies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.username = auth.jwt() ->> 'email' AND admins.is_active = true
    )
  );

CREATE POLICY "Admin can manage audit logs" ON public.audit_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.username = auth.jwt() ->> 'email' AND admins.is_active = true
    )
  );