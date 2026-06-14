-- Idempotent cleanup: revoke dangerous legacy policies from early VezCore migrations.

DO $$
BEGIN
  IF to_regclass('public.contact_messages') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert messages" ON public.contact_messages';
    REVOKE ALL ON TABLE public.contact_messages FROM anon, authenticated;
  END IF;

  IF to_regclass('public.newsletter_subscribers') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers';
    REVOKE ALL ON TABLE public.newsletter_subscribers FROM anon, authenticated;
  END IF;

  IF to_regclass('newsletter_subscribers') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view subscribers" ON newsletter_subscribers';
    REVOKE ALL ON TABLE newsletter_subscribers FROM anon, authenticated;
  END IF;
END $$;

DROP POLICY IF EXISTS vv_newsletter_send_logs_select_authenticated ON public.vv_newsletter_send_logs;

DROP POLICY IF EXISTS vv_newsletter_send_logs_select_admin ON public.vv_newsletter_send_logs;
CREATE POLICY vv_newsletter_send_logs_select_admin
  ON public.vv_newsletter_send_logs
  FOR SELECT
  TO authenticated
  USING ((SELECT public.vv_is_admin()));
