BEGIN;

ALTER TABLE public.vv_newsletter_subscribers
  ADD COLUMN IF NOT EXISTS email_hash text;

DROP FUNCTION IF EXISTS public.cleanup_expired_private_data();
CREATE FUNCTION public.cleanup_expired_private_data()
RETURNS TABLE(
  expired_messages bigint,
  expired_unconfirmed_subscribers bigint,
  anonymized_unsubscribed bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  message_count bigint;
  subscriber_count bigint;
  anonymized_count bigint;
BEGIN
  DELETE FROM public.messages
  WHERE created_at < now() - interval '2 years';
  GET DIAGNOSTICS message_count = ROW_COUNT;

  DELETE FROM public.vv_newsletter_subscribers
  WHERE is_active = false
    AND confirmed_at IS NULL
    AND confirmation_requested_at < now() - interval '30 days';
  GET DIAGNOSTICS subscriber_count = ROW_COUNT;

  UPDATE public.vv_newsletter_subscribers
  SET email_hash = encode(digest(lower(email), 'sha256'), 'hex'),
      email = 'erased+' || id::text || '@invalid.local',
      token = encode(gen_random_bytes(32), 'hex'),
      source = 'erased',
      tags = '{}',
      first_name = NULL,
      last_name = NULL,
      consent_ip = NULL,
      consent_user_agent = NULL,
      updated_at = now()
  WHERE is_active = false
    AND confirmed_at IS NOT NULL
    AND unsubscribed_at < now() - interval '30 days'
    AND email_hash IS NULL;
  GET DIAGNOSTICS anonymized_count = ROW_COUNT;

  RETURN QUERY SELECT message_count, subscriber_count, anonymized_count;
END $$;

REVOKE ALL ON FUNCTION public.cleanup_expired_private_data() FROM PUBLIC;

DO $$
DECLARE api_role text;
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

UPDATE public.vv_legal_documents
SET content_pl = replace(
      content_pl,
      '*   **Dane subskrybenta newslettera** - przechowywane do momentu cofnięcia zgody (wypisania się z newslettera); niepotwierdzone zapisy są usuwane po 30 dniach.',
      '*   **Dane subskrybenta newslettera** - przechowywane do momentu cofnięcia zgody (wypisania się z newslettera); niepotwierdzone zapisy są usuwane po 30 dniach, a 30 dni po wypisaniu adres e-mail i dane techniczne są anonimizowane. Zachowujemy wyłącznie skrót adresu oraz daty zgody i jej cofnięcia jako minimalny dowód zgodności.'
    ),
    content_en = replace(
      content_en,
      '*   **Newsletter subscriber data** - stored until consent is withdrawn (unsubscribing); unconfirmed signups are deleted after 30 days.',
      '*   **Newsletter subscriber data** - stored until consent is withdrawn (unsubscribing); unconfirmed signups are deleted after 30 days, and the e-mail address and technical data are anonymized 30 days after unsubscribing. Only a hash of the address and the consent/withdrawal dates remain as minimum compliance evidence.'
    ),
    version = '2026.08.09',
    last_updated = DATE '2026-08-09',
    updated_at = now()
WHERE document_key = 'privacy_policy';

COMMIT;
