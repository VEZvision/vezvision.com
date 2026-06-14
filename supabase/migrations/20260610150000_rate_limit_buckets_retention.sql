-- Periodic cleanup for rate_limit_buckets (no TTL in consume_rate_limit).

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

REVOKE ALL ON FUNCTION public.cleanup_rate_limit_buckets(interval) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_buckets(interval) TO service_role;
