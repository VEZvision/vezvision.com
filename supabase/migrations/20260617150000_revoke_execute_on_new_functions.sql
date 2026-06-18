-- Revoke EXECUTE on SECURITY DEFINER functions from anon and authenticated.
REVOKE EXECUTE ON FUNCTION public.cleanup_old_blog_post_views(int) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.vv_message_send_logs_set_updated_at() FROM anon, authenticated;
