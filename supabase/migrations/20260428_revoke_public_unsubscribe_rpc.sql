-- Public unsubscribe is handled by the unsubscribe-newsletter edge function.

revoke execute on function public.unsubscribe_by_token(text) from anon, authenticated, public;
grant execute on function public.unsubscribe_by_token(text) to service_role;
