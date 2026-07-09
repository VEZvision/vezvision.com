do $$
begin
  if exists (select 1 from cron.job where jobname = 'retry-failed-message-sends') then
    perform cron.unschedule('retry-failed-message-sends');
  end if;

  if (
    select count(*)
    from vault.decrypted_secrets
    where name in ('project_url', 'service_role_key')
  ) = 2 then
    perform cron.schedule(
      'retry-failed-message-sends',
      '*/15 * * * *',
      $net$
        select net.http_post(
          url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v2/retry-message-sends',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'),
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
