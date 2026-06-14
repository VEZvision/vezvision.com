-- Document production RLS for public write tables (website audit trail).

ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can insert messages" ON public.messages;
CREATE POLICY "Service role can insert messages" ON public.messages
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read messages" ON public.messages;
CREATE POLICY "Admins can read messages" ON public.messages
  FOR SELECT TO authenticated
  USING (public.vv_is_admin());

ALTER TABLE IF EXISTS public.vv_newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vv_newsletter_subscribers_admin_all" ON public.vv_newsletter_subscribers;
CREATE POLICY "vv_newsletter_subscribers_admin_all" ON public.vv_newsletter_subscribers
  FOR ALL TO authenticated
  USING (public.vv_is_admin())
  WITH CHECK (public.vv_is_admin());

REVOKE ALL ON TABLE public.messages FROM anon;
REVOKE ALL ON TABLE public.vv_newsletter_subscribers FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.messages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vv_newsletter_subscribers TO service_role;
