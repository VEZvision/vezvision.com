-- Track email/webhook send attempts for contact form messages.
-- Enables retry logic and visibility into delivery failures.
CREATE TABLE IF NOT EXISTS public.vv_message_send_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
  send_type text NOT NULL CHECK (send_type IN ('notification', 'auto_reply', 'webhook')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  provider_message_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vv_message_send_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY vv_message_send_logs_service_role_all
  ON public.vv_message_send_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY vv_message_send_logs_admin_all
  ON public.vv_message_send_logs
  FOR ALL
  TO authenticated
  USING (vv_is_admin())
  WITH CHECK (vv_is_admin());

CREATE INDEX idx_vv_message_send_logs_message_id ON public.vv_message_send_logs (message_id);
CREATE INDEX idx_vv_message_send_logs_status_pending ON public.vv_message_send_logs (status) WHERE status = 'pending';

CREATE OR REPLACE FUNCTION public.vv_message_send_logs_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vv_message_send_logs_updated_at ON public.vv_message_send_logs;
CREATE TRIGGER vv_message_send_logs_updated_at
  BEFORE UPDATE ON public.vv_message_send_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.vv_message_send_logs_set_updated_at();
