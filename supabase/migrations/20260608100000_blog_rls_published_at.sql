-- Defense in depth: hide future-dated published posts at RLS level (app also filters published_at).

DROP POLICY IF EXISTS "vv_blog_posts_public_read" ON public.vv_blog_posts;

CREATE POLICY "vv_blog_posts_public_read" ON public.vv_blog_posts
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    AND (published_at IS NULL OR published_at <= now())
  );

DROP POLICY IF EXISTS "vv_blog_post_categories_public_read" ON public.vv_blog_post_categories;

CREATE POLICY "vv_blog_post_categories_public_read" ON public.vv_blog_post_categories
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vv_blog_posts p
      WHERE p.id = post_id
        AND p.status = 'published'
        AND (p.published_at IS NULL OR p.published_at <= now())
    )
  );
