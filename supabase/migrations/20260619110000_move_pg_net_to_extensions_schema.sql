-- Move pg_net extension from public schema to extensions schema.
-- pg_net does not support ALTER EXTENSION SET SCHEMA, so we drop and recreate.
-- pg_net's functions live in a hardcoded `net` schema regardless of extnamespace,
-- so net.http_post references (cron job) continue to work after recreation.
-- The cron job is unscheduled first to avoid a race during the brief drop/create window.

-- 1. Unschedule retry cron that calls net.http_post
select cron.unschedule('retry-failed-message-sends');

-- 2. Drop pg_net (cascade drops the net schema + functions)
drop extension if exists pg_net cascade;

-- 3. Recreate with extnamespace = extensions
create extension pg_net with schema extensions;

-- 4. Grant usage (pg_net creates net schema with functions)
grant usage on schema net to postgres;

-- 5. Re-schedule retry cron (net.http_post works — schema recreated by pg_net)
do $$
begin
  if exists (select 1 from vault.decrypted_secrets where name in ('project_url', 'service_role_key')) then
    perform cron.schedule(
      'retry-failed-message-sends',
      '*/15 * * * *',
      $net$
        select net.http_post(
          url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v2/retry-message-sends',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
          ),
          body := jsonb_build_object('triggered_by', 'pg_cron', 'time', now()),
          timeout_milliseconds := 10000
        ) as request_id;
      $net$
    );
  else
    raise notice 'Vault secrets not configured — retry-failed-message-sends cron skipped.';
  end if;
exception when others then
  raise notice 'Retry cron schedule skipped: %', sqlerrm;
end
$$;
