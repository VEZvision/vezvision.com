-- Newsletter delivery logs + extended campaign statuses

create table if not exists public.vv_newsletter_send_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.vv_newsletter_campaigns(id) on delete cascade,
  subscriber_id uuid not null references public.vv_newsletter_subscribers(id) on delete cascade,
  subscriber_email text not null,
  status text not null check (status in ('sent', 'failed')),
  attempt_no integer not null default 1,
  provider text not null default 'resend',
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists vv_newsletter_send_logs_campaign_idx
  on public.vv_newsletter_send_logs (campaign_id, created_at desc);

create index if not exists vv_newsletter_send_logs_subscriber_idx
  on public.vv_newsletter_send_logs (subscriber_id, created_at desc);

alter table public.vv_newsletter_send_logs enable row level security;

drop policy if exists vv_newsletter_send_logs_select_authenticated on public.vv_newsletter_send_logs;
create policy vv_newsletter_send_logs_select_authenticated
  on public.vv_newsletter_send_logs
  for select
  to authenticated
  using (true);

drop policy if exists vv_newsletter_send_logs_manage_service_role on public.vv_newsletter_send_logs;
create policy vv_newsletter_send_logs_manage_service_role
  on public.vv_newsletter_send_logs
  for all
  to service_role
  using (true)
  with check (true);

alter table public.vv_newsletter_campaigns
  drop constraint if exists vv_newsletter_campaigns_status_check;

alter table public.vv_newsletter_campaigns
  add constraint vv_newsletter_campaigns_status_check
  check (status = any (array['draft'::text, 'scheduled'::text, 'sending'::text, 'sent'::text, 'failed'::text]));
