BEGIN;

CREATE OR REPLACE FUNCTION public.cleanup_expired_private_data()
RETURNS TABLE(expired_messages bigint, expired_unconfirmed_subscribers bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  message_count bigint;
  subscriber_count bigint;
BEGIN
  DELETE FROM public.messages
  WHERE created_at < now() - interval '2 years';
  GET DIAGNOSTICS message_count = ROW_COUNT;

  DELETE FROM public.vv_newsletter_subscribers
  WHERE is_active = false
    AND confirmed_at IS NULL
    AND confirmation_requested_at < now() - interval '30 days';
  GET DIAGNOSTICS subscriber_count = ROW_COUNT;

  RETURN QUERY SELECT message_count, subscriber_count;
END $$;

REVOKE ALL ON FUNCTION public.cleanup_expired_private_data() FROM PUBLIC;

DO $$
DECLARE
  api_role text;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['vezvision_api', 'vezvision_lab_api'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      EXECUTE format(
        'GRANT EXECUTE ON FUNCTION public.cleanup_expired_private_data() TO %I',
        api_role
      );
    END IF;
  END LOOP;
END $$;

COMMIT;
