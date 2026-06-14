-- Fix cleanup_rate_limit_buckets if the broken column name was already applied.
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_buckets(p_older_than interval DEFAULT interval '7 days')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.rate_limit_buckets
  WHERE window_started_at < now() - p_older_than;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

CREATE INDEX IF NOT EXISTS rate_limit_buckets_window_started_at_idx
  ON public.rate_limit_buckets (window_started_at);

-- Blog view dedup rows older than 90 days.
CREATE OR REPLACE FUNCTION public.cleanup_vv_blog_post_views(p_older_than interval DEFAULT interval '90 days')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.vv_blog_post_views
  WHERE viewed_at < now() - p_older_than;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_vv_blog_post_views(interval) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_vv_blog_post_views(interval) TO service_role;

CREATE INDEX IF NOT EXISTS vv_blog_post_views_viewed_at_idx
  ON public.vv_blog_post_views (viewed_at);
