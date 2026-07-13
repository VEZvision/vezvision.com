-- Create social_posts table
create table if not exists public.social_posts (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  platforms text[] not null check (cardinality(platforms) > 0), -- e.g. ARRAY['linkedin', 'twitter']
  media_urls text[], -- Optional images
  scheduled_for timestamptz not null,
  status text check (status in ('draft', 'scheduled', 'published', 'failed')) default 'draft',
  published_at timestamptz,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.social_posts enable row level security;

-- RLS Policies (Admin only)
create policy "Admins can manage social posts" on public.social_posts
  for all using (
    public.check_permission('marketing.edit')
  );

-- Trigger for updated_at
create trigger update_social_posts_updated_at
  before update on public.social_posts
  for each row execute function public.update_updated_at_column();
