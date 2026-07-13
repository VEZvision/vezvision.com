-- Analytics Visits Table (page_views) matches usePageTracker hook
create table if not exists public.page_views (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  user_agent text,
  referrer text,
  device_type text,
  visitor_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for page_views
alter table public.page_views enable row level security;

-- Allow ANYONE (anon) to insert visits (tracking)
create policy "Allow public insert for analytics"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

-- Allow admins to view analytics
create policy "Allow admins to view analytics"
  on public.page_views for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'super_admin')
    )
  );


-- Unified Calendar Events Table (for manual events)
create table if not exists public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  type text default 'event', -- 'event', 'meeting', 'deadline'
  color text default '#3B82F6',
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for calendar_events
alter table public.calendar_events enable row level security;

create policy "Admins can manage calendar events"
  on public.calendar_events for all
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'super_admin')
    )
  );
