-- Run once as the `postgres` database owner. Do not commit the password.
-- Example:
--   psql -d vezvision \
--     -v api_password='a-long-random-value' \
--     -v postgrest_password='a-different-long-random-value' \
--     -f provision-postgrest-role.sql
\if :{?api_password}
\else
  \quit 3
\endif
\if :{?postgrest_password}
\else
  \quit 3
\endif

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vezvision_api') THEN
    CREATE ROLE vezvision_api LOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vezvision_postgrest') THEN
    CREATE ROLE vezvision_postgrest LOGIN NOINHERIT;
  END IF;
END $$;

-- Re-assert the security attributes as well as the password. Older deployments
-- created `vezvision_api` as NOLOGIN, so changing only its password would leave
-- the API unable to authenticate after this migration.
ALTER ROLE vezvision_api LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD :'api_password';
ALTER ROLE vezvision_postgrest LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD :'postgrest_password';
ALTER ROLE anon NOLOGIN NOINHERIT;
REVOKE anon FROM vezvision_api;
GRANT anon TO vezvision_postgrest;

REVOKE ALL ON SCHEMA public FROM vezvision_postgrest;
GRANT USAGE ON SCHEMA public TO vezvision_postgrest;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM vezvision_postgrest;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM vezvision_postgrest;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM vezvision_postgrest;

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
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_buckets(interval) TO vezvision_api;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_private_data() TO vezvision_api;

DROP POLICY IF EXISTS messages_vezvision_api_insert ON public.messages;
DROP POLICY IF EXISTS messages_vezvision_api_select_id ON public.messages;
DROP POLICY IF EXISTS newsletter_vezvision_api_select ON public.vv_newsletter_subscribers;
DROP POLICY IF EXISTS newsletter_vezvision_api_insert ON public.vv_newsletter_subscribers;
DROP POLICY IF EXISTS newsletter_vezvision_api_update ON public.vv_newsletter_subscribers;
DROP POLICY IF EXISTS rate_limit_vezvision_api_select ON public.rate_limit_buckets;
DROP POLICY IF EXISTS rate_limit_vezvision_api_insert ON public.rate_limit_buckets;
DROP POLICY IF EXISTS rate_limit_vezvision_api_update ON public.rate_limit_buckets;

CREATE POLICY messages_vezvision_api_insert ON public.messages
  FOR INSERT TO vezvision_api WITH CHECK (true);
CREATE POLICY messages_vezvision_api_select_id ON public.messages
  FOR SELECT TO vezvision_api USING (true);
CREATE POLICY newsletter_vezvision_api_select ON public.vv_newsletter_subscribers
  FOR SELECT TO vezvision_api USING (true);
CREATE POLICY newsletter_vezvision_api_insert ON public.vv_newsletter_subscribers
  FOR INSERT TO vezvision_api WITH CHECK (true);
CREATE POLICY newsletter_vezvision_api_update ON public.vv_newsletter_subscribers
  FOR UPDATE TO vezvision_api USING (true) WITH CHECK (true);
CREATE POLICY rate_limit_vezvision_api_select ON public.rate_limit_buckets
  FOR SELECT TO vezvision_api USING (true);
CREATE POLICY rate_limit_vezvision_api_insert ON public.rate_limit_buckets
  FOR INSERT TO vezvision_api WITH CHECK (true);
CREATE POLICY rate_limit_vezvision_api_update ON public.rate_limit_buckets
  FOR UPDATE TO vezvision_api USING (true) WITH CHECK (true);
