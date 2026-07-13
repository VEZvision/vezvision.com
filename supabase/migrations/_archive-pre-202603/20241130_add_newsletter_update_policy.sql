-- Add UPDATE policy for newsletter_subscribers
-- Allowing admins with 'users.delete' permission to update subscribers (e.g. unsubscribe/reactivate)

DROP POLICY IF EXISTS "Admins can update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can update subscribers" ON public.newsletter_subscribers
  FOR UPDATE USING (public.check_permission('users.delete'));
