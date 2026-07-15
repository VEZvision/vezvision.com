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
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO vezvision_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO vezvision_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO vezvision_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO vezvision_api;
