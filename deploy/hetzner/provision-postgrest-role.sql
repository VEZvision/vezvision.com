-- Run once as the `postgres` database owner. Do not commit the password.
-- Example:
--   psql -d vezvision -v api_password='a-long-random-value' -f provision-postgrest-role.sql
\if :{?api_password}
\else
  \quit 3
\endif

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vezvision_api') THEN
    CREATE ROLE vezvision_api LOGIN NOINHERIT;
  END IF;
END $$;

ALTER ROLE vezvision_api PASSWORD :'api_password';
GRANT anon TO vezvision_api;
GRANT USAGE ON SCHEMA public TO vezvision_api;
REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM vezvision_api;
REVOKE USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public FROM vezvision_api;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM vezvision_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT, INSERT, UPDATE ON TABLES FROM vezvision_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE USAGE, SELECT ON SEQUENCES FROM vezvision_api;
GRANT SELECT ON public.vv_site_settings TO vezvision_api;
DROP POLICY IF EXISTS public_settings_vezvision_api_read ON public.vv_site_settings;
CREATE POLICY public_settings_vezvision_api_read
  ON public.vv_site_settings
  FOR SELECT TO vezvision_api
  USING (is_public);
GRANT INSERT, SELECT (id) ON public.messages TO vezvision_api;
GRANT SELECT, INSERT, UPDATE ON public.rate_limit_buckets TO vezvision_api;
GRANT SELECT, INSERT, UPDATE ON public.vv_newsletter_subscribers TO vezvision_api;
GRANT EXECUTE ON FUNCTION public.vv_blog_increment_views(p_post_slug text, p_client_ip text) TO vezvision_api;
