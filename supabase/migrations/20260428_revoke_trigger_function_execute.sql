-- Trigger functions should not be directly callable through REST/RPC.

revoke execute on function public.vv_validate_folder_acl_write() from anon, authenticated, public;
grant execute on function public.vv_validate_folder_acl_write() to service_role;
