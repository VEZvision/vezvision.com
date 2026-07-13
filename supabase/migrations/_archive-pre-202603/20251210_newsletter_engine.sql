-- Create newsletter_campaigns table
create table if not exists public.newsletter_campaigns (
  id uuid primary key default uuid_generate_v4(),
  subject text not null,
  content text not null, -- HTML content
  status text check (status in ('draft', 'sending', 'sent', 'failed')) default 'draft',
  sent_count integer default 0,
  total_recipients integer default 0,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create newsletter_logs (optional, for individual tracking)
create table if not exists public.newsletter_logs (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.newsletter_campaigns(id) on delete cascade,
  subscriber_email text not null,
  status text check (status in ('sent', 'failed')),
  error_message text,
  sent_at timestamptz default now()
);

-- Enable RLS
alter table public.newsletter_campaigns enable row level security;
alter table public.newsletter_logs enable row level security;

-- RLS Policies (Admin only)
create policy "Admins can manage campaigns" on public.newsletter_campaigns
  for all using (
    public.check_permission('marketing.edit')
  );

create policy "Admins can view logs" on public.newsletter_logs
  for select using (
    public.check_permission('marketing.view')
  );

-- Trigger
create trigger update_newsletter_campaigns_updated_at
  before update on public.newsletter_campaigns
  for each row execute function public.update_updated_at_column();
