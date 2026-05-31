DROP FUNCTION IF EXISTS public.vv_blog_increment_views(TEXT);

CREATE FUNCTION public.vv_blog_increment_views(post_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
  next_views INTEGER := 0;
BEGIN
  UPDATE public.vv_blog_posts
  SET views_count = views_count + 1
  WHERE slug = post_slug
    AND status = 'published'
    AND (published_at IS NULL OR published_at <= NOW())
  RETURNING views_count INTO next_views;

  RETURN COALESCE(next_views, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.vv_blog_increment_views(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vv_blog_increment_views(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.vv_blog_increment_views(TEXT) TO service_role;

ALTER TABLE public.vv_blog_posts DROP CONSTRAINT IF EXISTS vv_blog_posts_scheduled_for_required;
ALTER TABLE public.vv_blog_posts ADD CONSTRAINT vv_blog_posts_scheduled_for_required
  CHECK (status <> 'scheduled' OR scheduled_for IS NOT NULL);

CREATE OR REPLACE FUNCTION public.vv_blog_publish_scheduled()
RETURNS TABLE(published_id UUID, published_slug TEXT) AS $$
BEGIN
  RETURN QUERY
  UPDATE public.vv_blog_posts
  SET status = 'published',
      published_at = NOW(),
      scheduled_for = NULL
  WHERE status = 'scheduled'
    AND scheduled_for <= NOW()
  RETURNING id, slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.vv_blog_publish_scheduled() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.vv_blog_publish_scheduled() FROM anon;
REVOKE EXECUTE ON FUNCTION public.vv_blog_publish_scheduled() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.vv_blog_publish_scheduled() TO service_role;
