ALTER TABLE public.vv_newsletter_subscribers
  ADD COLUMN IF NOT EXISTS confirmation_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_ip inet,
  ADD COLUMN IF NOT EXISTS consent_user_agent text;

-- Preserve valid existing subscriptions when introducing double opt-in.
UPDATE public.vv_newsletter_subscribers
SET confirmed_at = COALESCE(confirmed_at, subscribed_at),
    confirmation_requested_at = COALESCE(confirmation_requested_at, subscribed_at)
WHERE is_active = true;

COMMENT ON COLUMN public.vv_newsletter_subscribers.confirmed_at IS
  'Timestamp of explicit double opt-in confirmation.';
COMMENT ON COLUMN public.vv_newsletter_subscribers.consent_ip IS
  'IP address recorded when double opt-in was confirmed.';
