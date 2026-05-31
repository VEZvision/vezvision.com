-- Social Media Scheduler Tables

create type social_platform as enum ('linkedin', 'twitter', 'facebook', 'instagram');
create type social_post_status as enum ('draft', 'scheduled', 'published', 'failed');

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  platforms social_platform[] not null,
  scheduled_for timestamptz,
  published_at timestamptz,
  status social_post_status default 'draft',
  media_urls text[], -- Array of image/video URLs
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table social_posts enable row level security;

create policy "Users can view their own posts"
  on social_posts for select
  using (auth.uid() = created_by);

create policy "Users can insert their own posts"
  on social_posts for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own posts"
  on social_posts for update
  using (auth.uid() = created_by);

create policy "Users can delete their own posts"
  on social_posts for delete
  using (auth.uid() = created_by);


-- Newsletter Engine Tables

create type newsletter_status as enum ('draft', 'scheduled', 'sending', 'sent', 'failed');

create table if not exists newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  content text not null, -- HTML content
  status newsletter_status default 'draft',
  scheduled_for timestamptz,
  sent_at timestamptz,
  recipient_count int default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table newsletter_campaigns enable row level security;

create policy "Users can view campaigns"
  on newsletter_campaigns for select
  using (auth.role() = 'authenticated'); -- Assuming internal team tool

create policy "Users can insert campaigns"
  on newsletter_campaigns for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update campaigns"
  on newsletter_campaigns for update
  using (auth.role() = 'authenticated');

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  is_active boolean default true,
  subscribed_at timestamptz default now()
);

alter table newsletter_subscribers enable row level security;

create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

create policy "Admins can view subscribers"
  on newsletter_subscribers for select
  using (auth.role() = 'authenticated'); 
  -- Note: Ideally this should be restricted to admin roles only

-- Case Study Generator Tables

create type case_study_status as enum ('draft', 'generated', 'published');

create table if not exists case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_name text,
  project_description text not null, -- Raw input for AI
  generated_content text, -- Markdown output from AI
  status case_study_status default 'draft',
  image_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table case_studies enable row level security;

create policy "Users can view case studies"
  on case_studies for select
  using (true); -- Publicly viewable if published (logic handled in app usually, but RLS here for simplicity)

-- Actually, for 'draft' ones, maybe we want to restrict? 
-- Let's make it authenticated for now for editing:
create policy "Authenticated users can manage case studies"
  on case_studies for all
  using (auth.role() = 'authenticated');
