-- Dedup table for per-IP blog view counting (used by vv_blog_increment_views).

CREATE TABLE IF NOT EXISTS public.vv_blog_post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL,
  ip_hash text NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS vv_blog_post_views_daily_dedup_idx
  ON public.vv_blog_post_views (
    post_slug,
    ip_hash,
    (date_trunc('day', viewed_at AT TIME ZONE 'UTC'))
  );

ALTER TABLE public.vv_blog_post_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vv_blog_post_views_service_role_only ON public.vv_blog_post_views;
CREATE POLICY vv_blog_post_views_service_role_only
  ON public.vv_blog_post_views
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON TABLE public.vv_blog_post_views FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.vv_blog_post_views TO service_role;
