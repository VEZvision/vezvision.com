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
