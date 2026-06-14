-- Align blog view counter RPC with production (PostgREST matches argument names exactly).

DROP FUNCTION IF EXISTS public.vv_blog_increment_views(text);
DROP FUNCTION IF EXISTS public.vv_blog_increment_views(text, text);

CREATE OR REPLACE FUNCTION public.vv_blog_increment_views(p_post_slug text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_next integer := 0;
BEGIN
  IF p_post_slug IS NULL OR trim(p_post_slug) = '' OR length(p_post_slug) > 200 THEN
    RETURN 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.vv_blog_posts
    WHERE slug = p_post_slug
      AND status = 'published'
      AND (published_at IS NULL OR published_at <= now())
  ) THEN
    RETURN 0;
  END IF;

  UPDATE public.vv_blog_posts
  SET views_count = views_count + 1
  WHERE slug = p_post_slug
    AND status = 'published'
    AND (published_at IS NULL OR published_at <= now())
  RETURNING views_count INTO v_next;

  RETURN COALESCE(v_next, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.vv_blog_increment_views(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vv_blog_increment_views(text) TO anon;
GRANT EXECUTE ON FUNCTION public.vv_blog_increment_views(text) TO service_role;
