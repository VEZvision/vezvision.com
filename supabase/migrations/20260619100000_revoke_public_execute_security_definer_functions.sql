-- Revoke EXECUTE from PUBLIC on SECURITY DEFINER functions.
-- Previous migration (20260617160100) revoked from anon/authenticated specifically,
-- but PUBLIC (which includes anon) still retained EXECUTE via default privileges.
-- This left the functions callable by anonymous clients via /rest/v1/rpc/...

revoke execute on function public.anonymize_old_messages(int) from public;
revoke execute on function public.cleanup_old_blog_post_views(int) from public;
revoke execute on function public.vv_message_send_logs_set_updated_at() from public;

-- Ensure service_role retains explicit access (already granted, explicit for clarity).
grant execute on function public.anonymize_old_messages(int) to service_role;
grant execute on function public.cleanup_old_blog_post_views(int) to service_role;
grant execute on function public.vv_message_send_logs_set_updated_at() to service_role;
