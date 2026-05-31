alter table public.vv_newsletter_campaigns
  add column if not exists template_config jsonb;
