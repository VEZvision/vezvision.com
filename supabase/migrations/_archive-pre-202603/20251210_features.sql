-- Create tenants table
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  domain text unique not null,
  name text not null,
  logo_url text,
  primary_color text,
  secondary_color text,
  created_at timestamptz default now()
);

-- Enable RLS for tenants
alter table tenants enable row level security;

-- Create policy for reading tenants (public read for white-labeling)
drop policy if exists "Tenants are viewable by everyone" on tenants;
create policy "Tenants are viewable by everyone" on tenants
  for select using (true);

-- Create mockups table
create table if not exists mockups (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  image_url text not null,
  created_at timestamptz default now()
);

-- Enable RLS for mockups
alter table mockups enable row level security;

drop policy if exists "Mockups are viewable by authenticated users" on mockups;
create policy "Mockups are viewable by authenticated users" on mockups
  for select using (auth.role() = 'authenticated');

drop policy if exists "Mockups are insertable by authenticated users" on mockups;
create policy "Mockups are insertable by authenticated users" on mockups
  for insert with check (auth.role() = 'authenticated');


-- Create mockup_comments table
create table if not exists mockup_comments (
  id uuid primary key default gen_random_uuid(),
  mockup_id uuid references mockups(id) on delete cascade,
  x float not null,
  y float not null,
  content text not null,
  is_resolved boolean default false,
  author_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Enable RLS for mockup_comments
alter table mockup_comments enable row level security;

drop policy if exists "Mockup comments are viewable by authenticated users" on mockup_comments;
create policy "Mockup comments are viewable by authenticated users" on mockup_comments
  for select using (auth.role() = 'authenticated');

drop policy if exists "Mockup comments are insertable by authenticated users" on mockup_comments;
create policy "Mockup comments are insertable by authenticated users" on mockup_comments
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Mockup comments are updateable by authenticated users" on mockup_comments;
create policy "Mockup comments are updateable by authenticated users" on mockup_comments
  for update using (auth.role() = 'authenticated');


-- Create bug_reports table
create table if not exists bug_reports (
  id uuid primary key default gen_random_uuid(),
  description text,
  video_url text,
  reporter_id uuid references auth.users(id),
  status text default 'new',
  created_at timestamptz default now()
);

-- Enable RLS for bug_reports
alter table bug_reports enable row level security;

drop policy if exists "Bug reports are viewable by authenticated users" on bug_reports;
create policy "Bug reports are viewable by authenticated users" on bug_reports
  for select using (auth.role() = 'authenticated');

drop policy if exists "Bug reports are insertable by authenticated users" on bug_reports;
create policy "Bug reports are insertable by authenticated users" on bug_reports
  for insert with check (auth.role() = 'authenticated');

-- Create storage bucket for mockups if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('feature-assets', 'feature-assets', true)
on conflict (id) do nothing;

-- Storage policies
-- We cannot drop policies on storage.objects easily without exact names which might vary or be system wide.
-- Instead, we will wrap in DO blocks to avoid errors if they exist.

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'objects' 
    and policyname = 'Public Access'
    and schemaname = 'storage'
  ) then
    create policy "Public Access" on storage.objects for select using ( bucket_id = 'feature-assets' );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'objects' 
    and policyname = 'Authenticated Upload'
    and schemaname = 'storage'
  ) then
    create policy "Authenticated Upload" on storage.objects for insert with check ( bucket_id = 'feature-assets' and auth.role() = 'authenticated' );
  end if;
end $$;
