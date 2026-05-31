-- Dodanie kolumny scheduled_for do tabeli vv_blog_posts
ALTER TABLE public.vv_blog_posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- Aktualizacja CHECK constraint na status
ALTER TABLE public.vv_blog_posts DROP CONSTRAINT IF EXISTS vv_blog_posts_status_check;
ALTER TABLE public.vv_blog_posts ADD CONSTRAINT vv_blog_posts_status_check CHECK (status IN ('draft', 'published', 'archived', 'scheduled'));

-- Indeks dla szybkiego wyszukiwania zaplanowanych postów
CREATE INDEX IF NOT EXISTS idx_vv_blog_posts_scheduled ON public.vv_blog_posts(scheduled_for) WHERE status = 'scheduled';

-- Funkcja do publikowania zaplanowanych postów (wywoływana przez cron/edge function)
CREATE OR REPLACE FUNCTION public.vv_blog_publish_scheduled()
RETURNS TABLE(published_id UUID, published_slug TEXT) AS $$
DECLARE
  affected_count INT := 0;
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uprawnienia
GRANT EXECUTE ON FUNCTION public.vv_blog_publish_scheduled() TO authenticated;
GRANT EXECUTE ON FUNCTION public.vv_blog_publish_scheduled() TO service_role;
