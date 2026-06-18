-- Scheduled jobs via pg_cron.
-- 1. Cleanup old blog post views daily at 03:00 (records older than 90 days).
-- 2. Anonymize contact messages older than 3 years weekly on Sunday at 04:00 (GDPR retention).
-- 3. Retry failed message send logs every 15 minutes via pg_net to a dedicated retry edge function.

select cron.schedule(
  'cleanup-old-blog-post-views-daily',
  '0 3 * * *',
  $$ select public.cleanup_old_blog_post_views(90); $$
);

create or replace function public.anonymize_old_messages(p_older_than_years int default 3)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  affected int;
begin
  update public.messages
  set
    full_name = '[anonymized]',
    email = '[anonymized]_' || md5(email) || '@invalid.vezvision.com',
    phone = null,
    message = '[anonymized after retention period]',
    client_ip = null,
    status = 'anonymized'
  where created_at < now() - (p_older_than_years || ' years')::interval
    and status <> 'anonymized';
  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke execute on function public.anonymize_old_messages(int) from anon, authenticated;
grant execute on function public.anonymize_old_messages(int) to service_role;

select cron.schedule(
  'anonymize-old-messages-weekly',
  '0 4 * * 0',
  $$ select public.anonymize_old_messages(3); $$
);

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
