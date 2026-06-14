-- Per-IP blog view dedup via vv_blog_post_views; RPC callable only through edge (service_role).

DROP FUNCTION IF EXISTS public.vv_blog_increment_views(text);

CREATE OR REPLACE FUNCTION public.vv_blog_increment_views(
  p_post_slug text,
  p_client_ip text DEFAULT 'unknown'::text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, extensions
AS $$
DECLARE
  v_next integer := 0;
  v_rate_limit record;
  v_ip text := left(trim(coalesce(p_client_ip, 'unknown')), 128);
  v_ip_hash text;
BEGIN
  IF p_post_slug IS NULL OR trim(p_post_slug) = '' OR length(p_post_slug) > 200 THEN
    RETURN 0;
  END IF;

  v_ip_hash := encode(digest(v_ip || ':' || p_post_slug, 'sha256'), 'hex');

  SELECT * INTO v_rate_limit
  FROM public.consume_rate_limit('blog-view-burst:' || v_ip_hash, 30, 60000);

  IF NOT v_rate_limit.allowed THEN
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

  BEGIN
    INSERT INTO public.vv_blog_post_views (post_slug, ip_hash)
    VALUES (p_post_slug, v_ip_hash);
  EXCEPTION
    WHEN unique_violation THEN
      SELECT views_count
      INTO v_next
      FROM public.vv_blog_posts
      WHERE slug = p_post_slug;

      RETURN COALESCE(v_next, 0);
  END;

  UPDATE public.vv_blog_posts
  SET views_count = views_count + 1
  WHERE slug = p_post_slug
    AND status = 'published'
    AND (published_at IS NULL OR published_at <= now())
  RETURNING views_count INTO v_next;

  RETURN COALESCE(v_next, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.vv_blog_increment_views(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vv_blog_increment_views(text, text) TO service_role;
