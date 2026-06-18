-- Aggregate daily blog post views and clean up records older than 90 days.
CREATE OR REPLACE FUNCTION public.cleanup_old_blog_post_views(p_older_than_days int DEFAULT 90)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count int;
BEGIN
  DELETE FROM public.vv_blog_post_views
  WHERE viewed_at < now() - (p_older_than_days || ' days')::interval
  RETURNING 1 INTO deleted_count;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_old_blog_post_views(int) TO service_role;
