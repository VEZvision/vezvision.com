-- RLS Policies dla tabeli services
DROP POLICY IF EXISTS "Admin can manage services" ON public.services;
DROP POLICY IF EXISTS "Public can view published services" ON public.services;

CREATE POLICY "Admin can manage services" ON public.services FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view published services" ON public.services FOR SELECT
USING (status = 'published');

-- RLS Policies dla tabeli service_translations
DROP POLICY IF EXISTS "Admin can manage service translations" ON public.service_translations;
DROP POLICY IF EXISTS "Public can view service translations" ON public.service_translations;

CREATE POLICY "Admin can manage service translations" ON public.service_translations FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view service translations" ON public.service_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE services.id = service_translations.service_id 
    AND services.status = 'published'
  )
);

-- RLS Policies dla tabeli service_categories
DROP POLICY IF EXISTS "Admin can manage service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Public can view service categories" ON public.service_categories;

CREATE POLICY "Admin can manage service categories" ON public.service_categories FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view service categories" ON public.service_categories FOR SELECT
USING (true);

-- RLS Policies dla tabeli service_category_mappings
DROP POLICY IF EXISTS "Admin can manage service category mappings" ON public.service_category_mappings;
DROP POLICY IF EXISTS "Public can view service category mappings" ON public.service_category_mappings;

CREATE POLICY "Admin can manage service category mappings" ON public.service_category_mappings FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view service category mappings" ON public.service_category_mappings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE services.id = service_category_mappings.service_id 
    AND services.status = 'published'
  )
);

-- RLS Policies dla tabeli blog_posts
DROP POLICY IF EXISTS "Admin can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;

CREATE POLICY "Admin can manage blog posts" ON public.blog_posts FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view published blog posts" ON public.blog_posts FOR SELECT
USING (status = 'published');

-- RLS Policies dla tabeli blog_post_translations
DROP POLICY IF EXISTS "Admin can manage blog post translations" ON public.blog_post_translations;
DROP POLICY IF EXISTS "Public can view blog post translations" ON public.blog_post_translations;

CREATE POLICY "Admin can manage blog post translations" ON public.blog_post_translations FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view blog post translations" ON public.blog_post_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blog_posts 
    WHERE blog_posts.id = blog_post_translations.post_id 
    AND blog_posts.status = 'published'
  )
);

-- RLS Policies dla tabeli blog_categories
DROP POLICY IF EXISTS "Admin can manage blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Public can view blog categories" ON public.blog_categories;

CREATE POLICY "Admin can manage blog categories" ON public.blog_categories FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view blog categories" ON public.blog_categories FOR SELECT
USING (true);

-- RLS Policies dla tabeli blog_post_categories
DROP POLICY IF EXISTS "Admin can manage blog post categories" ON public.blog_post_categories;
DROP POLICY IF EXISTS "Public can view blog post categories" ON public.blog_post_categories;

CREATE POLICY "Admin can manage blog post categories" ON public.blog_post_categories FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view blog post categories" ON public.blog_post_categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blog_posts 
    WHERE blog_posts.id = blog_post_categories.post_id 
    AND blog_posts.status = 'published'
  )
);

-- RLS Policies dla tabeli blog_comments
DROP POLICY IF EXISTS "Admin can manage blog comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Public can view approved blog comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can create blog comments" ON public.blog_comments;

CREATE POLICY "Admin can manage blog comments" ON public.blog_comments FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public can view approved blog comments" ON public.blog_comments FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can create blog comments" ON public.blog_comments FOR INSERT
WITH CHECK (true);