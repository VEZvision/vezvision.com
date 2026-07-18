-- Provision the private PostgREST endpoint used by VEZcore.
-- Run as the `postgres` database owner. Never commit either secret.
--
-- Example:
--   psql -d vezvision \
--     -v admin_password='a-long-random-value' \
--     -v admin_api_key_sha256='sha256-hex' \
--     -f provision-admin-postgrest.sql
\if :{?admin_password}
\else
  \quit 3
\endif
\if :{?admin_api_key_sha256}
\else
  \quit 3
\endif

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vezvision_admin_api') THEN
    CREATE ROLE vezvision_admin_api NOLOGIN NOINHERIT BYPASSRLS;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vezvision_admin_authenticator') THEN
    CREATE ROLE vezvision_admin_authenticator LOGIN NOINHERIT;
  END IF;
END $$;

ALTER ROLE vezvision_admin_authenticator PASSWORD :'admin_password';
GRANT vezvision_admin_api TO vezvision_admin_authenticator;

GRANT USAGE ON SCHEMA public TO vezvision_admin_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vezvision_admin_api;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO vezvision_admin_api;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO vezvision_admin_api;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO vezvision_admin_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO vezvision_admin_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO vezvision_admin_api;

CREATE OR REPLACE FUNCTION public.check_vezvision_admin_api_key()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  supplied_key text;
  expected_hash text;
BEGIN
  supplied_key := current_setting('request.headers', true)::jsonb ->> 'x-internal-api-key';
  expected_hash := current_setting('app.vezvision_admin_api_key_sha256', true);

  IF supplied_key IS NULL
     OR expected_hash IS NULL
     OR expected_hash = ''
     OR encode(public.digest(supplied_key, 'sha256'), 'hex') <> expected_hash THEN
    RAISE insufficient_privilege USING MESSAGE = 'invalid internal API key';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.check_vezvision_admin_api_key() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_vezvision_admin_api_key() TO vezvision_admin_api;

ALTER DATABASE vezvision
  SET app.vezvision_admin_api_key_sha256 = :'admin_api_key_sha256';

COMMIT;
