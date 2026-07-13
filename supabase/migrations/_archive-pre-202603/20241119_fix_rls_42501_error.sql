-- Fix RLS 42501 error by creating admin function first
-- This migration creates a simple admin check function and applies it to all tables

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
    AND admins.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- Simplify RLS policies for projects table
DROP POLICY IF EXISTS "Public can view active projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can manage projects" ON public.projects;

CREATE POLICY "Public can view active projects" ON public.projects FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admin can manage projects" ON public.projects FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Simplify RLS policies for project_translations table
DROP POLICY IF EXISTS "Public can view translations for active projects" ON public.project_translations;
DROP POLICY IF EXISTS "Admin can manage translations" ON public.project_translations;

CREATE POLICY "Public can view translations for active projects" ON public.project_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_translations.project_id AND projects.status = 'active'
    )
  );

CREATE POLICY "Admin can manage translations" ON public.project_translations FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Simplify RLS policies for project_images table
DROP POLICY IF EXISTS "Public can view images for active projects" ON public.project_images;
DROP POLICY IF EXISTS "Admin can manage images" ON public.project_images;

CREATE POLICY "Public can view images for active projects" ON public.project_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_images.project_id AND projects.status = 'active'
    )
  );

CREATE POLICY "Admin can manage images" ON public.project_images FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Simplify RLS policies for project_technologies table
DROP POLICY IF EXISTS "Public can view technologies for active projects" ON public.project_technologies;
DROP POLICY IF EXISTS "Admin can manage technologies" ON public.project_technologies;

CREATE POLICY "Public can view technologies for active projects" ON public.project_technologies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_technologies.project_id AND projects.status = 'active'
    )
  );

CREATE POLICY "Admin can manage technologies" ON public.project_technologies FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Simplify RLS policies for services table
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
DROP POLICY IF EXISTS "Admin can manage services" ON public.services;

CREATE POLICY "Public can view active services" ON public.services FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admin can manage services" ON public.services FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Simplify RLS policies for service_translations table
DROP POLICY IF EXISTS "Public can view translations for active services" ON public.service_translations;
DROP POLICY IF EXISTS "Admin can manage service translations" ON public.service_translations;

CREATE POLICY "Public can view translations for active services" ON public.service_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = service_translations.service_id AND services.status = 'active'
    )
  );

CREATE POLICY "Admin can manage service translations" ON public.service_translations FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Simplify RLS policies for blog_posts table
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admin can manage posts" ON public.blog_posts;

CREATE POLICY "Public can view published posts" ON public.blog_posts FOR SELECT
  USING (status = 'published' AND published_at <= NOW());

CREATE POLICY "Admin can manage posts" ON public.blog_posts FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Simplify RLS policies for blog_translations table
DROP POLICY IF EXISTS "Public can view translations for published posts" ON public.blog_translations;
DROP POLICY IF EXISTS "Admin can manage blog translations" ON public.blog_translations;

CREATE POLICY "Public can view translations for published posts" ON public.blog_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.blog_posts
      WHERE blog_posts.id = blog_translations.post_id AND blog_posts.status = 'published' AND blog_posts.published_at <= NOW()
    )
  );

CREATE POLICY "Admin can manage blog translations" ON public.blog_translations FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Simplify RLS policies for blog_categories table
DROP POLICY IF EXISTS "Public can view categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON public.blog_categories;

CREATE POLICY "Public can view categories" ON public.blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage categories" ON public.blog_categories FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Simplify RLS policies for blog_comments table
DROP POLICY IF EXISTS "Public can view approved comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Admin can manage comments" ON public.blog_comments;

CREATE POLICY "Public can view approved comments" ON public.blog_comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can create comments" ON public.blog_comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND status = 'pending');

CREATE POLICY "Admin can manage comments" ON public.blog_comments FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Simplify storage policies
DROP POLICY IF EXISTS "Admin can manage portfolio files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage service files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage blog files" ON storage.objects;

CREATE POLICY "Admin can manage storage files" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id IN ('portfolio', 'services', 'blog') AND public.is_admin_user()
  )
  WITH CHECK (
    bucket_id IN ('portfolio', 'services', 'blog') AND public.is_admin_user()
  );

-- Grant necessary permissions
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.project_translations TO anon;
GRANT SELECT ON public.project_images TO anon;
GRANT SELECT ON public.project_technologies TO anon;
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.service_translations TO anon;
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT ON public.blog_translations TO anon;
GRANT SELECT ON public.blog_categories TO anon;
GRANT SELECT ON public.blog_comments TO anon;
GRANT INSERT ON public.blog_comments TO authenticated;

GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.project_translations TO authenticated;
GRANT ALL ON public.project_images TO authenticated;
GRANT ALL ON public.project_technologies TO authenticated;
GRANT ALL ON public.services TO authenticated;
GRANT ALL ON public.service_translations TO authenticated;
GRANT ALL ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_translations TO authenticated;
GRANT ALL ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_comments TO authenticated;