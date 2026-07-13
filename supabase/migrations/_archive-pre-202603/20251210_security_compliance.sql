-- 1. IP Whitelisting System

create table if not exists public.security_settings (
  id integer primary key generated always as identity,
  ip_restriction_enabled boolean default false,
  updated_at timestamptz default now()
);

-- Initialize settings if empty
insert into public.security_settings (ip_restriction_enabled)
select false where not exists (select 1 from public.security_settings);

create table if not exists public.whitelisted_ips (
  id uuid primary key default uuid_generate_v4(),
  ip_address text not null, -- Store as text to allow flexible formats or CIDR specific types
  description text,
  added_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.security_settings enable row level security;
alter table public.whitelisted_ips enable row level security;

create policy "Admins can manage security settings" on public.security_settings
  for all using (
    public.check_permission('users.manage_roles')
  );

create policy "Admins can manage whitelist" on public.whitelisted_ips
  for all using (
    public.check_permission('users.manage_roles')
  );

-- Function to check IP (To be used in RLS or Edge Functions)
-- Note: Getting the request IP in Postgres directly is tricky safely without extensions or specific Supabase headers.
-- For now, we will enforce this via the Application Layer (Admin Layout) or Edge Functions using this table.
-- RLS approach: `auth.jwt() -> 'app_metadata'` doesn't always contain IP.
-- We will implement the check in `src/components/layout/AdminLayout.tsx` and sensitive Edge Functions by querying this table.


-- 2. Data Retention (RODO/GDPR)

-- Function to anonymize old data
create or replace function public.anonymize_old_data()
returns void
language plpgsql
security definer
as $$
begin
  -- Anonymize leads older than 5 years
  update public.leads
  set 
    name = 'ANONYMIZED',
    email = 'anonymized_' || id || '@example.com',
    phone = null,
    linkedin_url = null,
    company = 'ANONYMIZED'
  where created_at < (now() - interval '5 years')
  and name != 'ANONYMIZED';

  -- Add other tables here if needed (e.g. clients)
  -- RAISE NOTICE 'Anonymization complete';
end;
$$;
