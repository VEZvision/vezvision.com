-- Enable pg_cron for scheduled jobs and pg_net for HTTP requests from Postgres.
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create extension if not exists pg_net;
grant usage on schema net to postgres;
