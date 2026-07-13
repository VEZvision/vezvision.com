-- Create projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text check (category in ('web-apps','websites','tools','mobile-apps','concepts','prototypes','demos')) not null,
  status text check (status in ('active','archived','coming-soon','concept','prototype')) default 'active',
  featured boolean default false,
  order_index integer default 0,
  demo_url text,
  github_url text,
  client_name text,
  cover_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create project_translations table for multilingual content
create table if not exists public.project_translations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  locale text check (locale in ('pl','en')) not null,
  title text not null,
  short_description text not null,
  description text not null,
  seo_title text,
  seo_description text,
  seo_keywords text[],
  unique (project_id, locale)
);

-- Create project_images table for image gallery
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  path text not null,
  type text check (type in ('screenshot','mockup','logo','banner','concept','prototype')) default 'screenshot',
  "order" integer default 0,
  alt_pl text,
  alt_en text,
  created_at timestamptz default now()
);

-- Create project_technologies table
create table if not exists public.project_technologies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  color text not null,
  icon text,
  "order" integer default 0
);

-- Create audit_logs table for tracking changes
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text check (action in ('insert','update','delete')),
  admin_id uuid references public.admins(id),
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index idx_projects_slug on public.projects(slug);
create index idx_projects_status on public.projects(status);
create index idx_projects_order_index on public.projects(order_index);
create index idx_projects_featured on public.projects(featured);
create index idx_project_translations_project_locale on public.project_translations(project_id, locale);
create index idx_project_images_project on public.project_images(project_id);
create index idx_project_technologies_project on public.project_technologies(project_id);
create index idx_audit_logs_table_record on public.audit_logs(table_name, record_id);

-- Enable Row Level Security
alter table public.projects enable row level security;
alter table public.project_translations enable row level security;
alter table public.project_images enable row level security;
alter table public.project_technologies enable row level security;
alter table public.audit_logs enable row level security;

-- RLS Policies for projects
-- Select: public can view active projects, admin can view all
create policy "Public can view active projects" on public.projects for select
  using (status = 'active');

create policy "Admin can view all projects" on public.projects for select
  using (
    exists (
      select 1 from public.admins
      where admins.username = auth.jwt() ->> 'email' and admins.is_active = true
    )
  );

-- Insert/Update/Delete: only admin
create policy "Admin can insert projects" on public.projects for insert
  with check (
    exists (
      select 1 from public.admins
      where admins.username = auth.jwt() ->> 'email' and admins.is_active = true
    )
  );

create policy "Admin can update projects" on public.projects for update
  using (
    exists (
      select 1 from public.admins
      where admins.username = auth.jwt() ->> 'email' and admins.is_active = true
    )
  );

create policy "Admin can delete projects" on public.projects for delete
  using (
    exists (
      select 1 from public.admins
      where admins.username = auth.jwt() ->> 'email' and admins.is_active = true
    )
  );

-- RLS Policies for project_translations (same admin-only pattern)
create policy "Public can view translations for active projects" on public.project_translations for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_translations.project_id and projects.status = 'active'
    )
  );

create policy "Admin can manage translations" on public.project_translations for all
  using (
    exists (
      select 1 from public.admins
      where admins.username = auth.jwt() ->> 'email' and admins.is_active = true
    )
  );

-- RLS Policies for project_images
create policy "Public can view images for active projects" on public.project_images for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_images.project_id and projects.status = 'active'
    )
  );

create policy "Admin can manage images" on public.project_images for all
  using (
    exists (
      select 1 from public.admins
      where admins.username = auth.jwt() ->> 'email' and admins.is_active = true
    )
  );

-- RLS Policies for project_technologies
create policy "Public can view technologies for active projects" on public.project_technologies for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_technologies.project_id and projects.status = 'active'
    )
  );

create policy "Admin can manage technologies" on public.project_technologies for all
  using (
    exists (
      select 1 from public.admins
      where admins.username = auth.jwt() ->> 'email' and admins.is_active = true
    )
  );

-- RLS Policies for audit_logs (admin can view)
create policy "Admin can view audit logs" on public.audit_logs for select
  using (
    exists (
      select 1 from public.admins
      where admins.username = auth.jwt() ->> 'email' and admins.is_active = true
    )
  );

-- Grant permissions to anon and authenticated roles
grant select on public.projects to anon, authenticated;
grant select on public.project_translations to anon, authenticated;
grant select on public.project_images to anon, authenticated;
grant select on public.project_technologies to anon, authenticated;
grant all on public.projects to authenticated;
grant all on public.project_translations to authenticated;
grant all on public.project_images to authenticated;
grant all on public.project_technologies to authenticated;
grant select on public.audit_logs to authenticated;

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for projects updated_at
create trigger update_projects_updated_at
    before update on public.projects
    for each row
    execute function public.update_updated_at_column();