-- Rate limit helper used by safe_insert_* RPCs.

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.rate_limit_buckets FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.rate_limit_buckets TO service_role;

DROP FUNCTION IF EXISTS public.consume_rate_limit(text, integer, integer);

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key text,
  p_max_requests integer,
  p_window_ms integer
)
RETURNS TABLE(allowed boolean, remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_now timestamptz := now();
  v_window interval := make_interval(secs => GREATEST(p_window_ms, 1000) / 1000.0);
  v_count integer := 0;
BEGIN
  IF p_key IS NULL OR length(trim(p_key)) = 0 OR p_max_requests <= 0 THEN
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  INSERT INTO public.rate_limit_buckets AS bucket (bucket_key, window_started_at, request_count)
  VALUES (left(p_key, 256), v_now, 1)
  ON CONFLICT (bucket_key) DO UPDATE
  SET
    request_count = CASE
      WHEN bucket.window_started_at + v_window < v_now THEN 1
      ELSE bucket.request_count + 1
    END,
    window_started_at = CASE
      WHEN bucket.window_started_at + v_window < v_now THEN v_now
      ELSE bucket.window_started_at
    END
  RETURNING request_count INTO v_count;

  RETURN QUERY
  SELECT v_count <= p_max_requests, GREATEST(p_max_requests - v_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;
