-- Standalone VEZvision schema for PostgreSQL + PostgREST.
-- This intentionally contains no Supabase auth, storage, Realtime, pg_net or pg_cron objects.
-- Apply as a database owner to the dedicated `vezvision` database.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.vv_site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT false,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.vv_page_seo (
  page_key text PRIMARY KEY, title_pl text NOT NULL, title_en text NOT NULL,
  description_pl text NOT NULL, description_en text NOT NULL,
  og_title_pl text NOT NULL DEFAULT '', og_title_en text NOT NULL DEFAULT '',
  og_description_pl text NOT NULL DEFAULT '', og_description_en text NOT NULL DEFAULT '',
  og_image_url text NOT NULL DEFAULT '', canonical_url text NOT NULL DEFAULT '',
  robots text NOT NULL DEFAULT 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1',
  indexable boolean NOT NULL DEFAULT true, structured_data_json text NOT NULL DEFAULT '',
  is_public boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.vv_page_sections (
  page_key text NOT NULL, section_key text NOT NULL, order_index integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true, content_pl jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_en jsonb NOT NULL DEFAULT '{}'::jsonb, config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_key, section_key)
);
CREATE TABLE IF NOT EXISTS public.vv_legal_documents (
  document_key text PRIMARY KEY, title_pl text NOT NULL, title_en text NOT NULL,
  content_pl text NOT NULL, content_en text NOT NULL, version text NOT NULL DEFAULT '1.0',
  last_updated date NOT NULL DEFAULT current_date, is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vv_blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE,
  name_pl text NOT NULL, name_en text, color text NOT NULL DEFAULT '#3B82F6',
  order_index integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.vv_blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  featured boolean NOT NULL DEFAULT false, featured_image text, reading_time integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0, published_at timestamptz, scheduled_for timestamptz, author_id uuid,
  title_pl text NOT NULL, title_en text, excerpt_pl text, excerpt_en text,
  content_pl text NOT NULL DEFAULT '', content_en text, meta_title_pl text, meta_title_en text,
  meta_desc_pl text, meta_desc_en text, tags_pl text[] NOT NULL DEFAULT '{}', tags_en text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.vv_blog_post_categories (
  post_id uuid NOT NULL REFERENCES public.vv_blog_posts(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.vv_blog_categories(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false, PRIMARY KEY (post_id, category_id)
);
CREATE TABLE IF NOT EXISTS public.vv_blog_post_views (
  post_id uuid NOT NULL REFERENCES public.vv_blog_posts(id) ON DELETE CASCADE,
  client_ip text NOT NULL, viewed_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (post_id, client_ip)
);

CREATE TABLE IF NOT EXISTS public.vv_project_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE,
  name_pl text NOT NULL, name_en text, order_index integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.vv_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured boolean NOT NULL DEFAULT false, order_index integer NOT NULL DEFAULT 0, cover_image text,
  demo_url text, github_url text, client_name text, title_pl text NOT NULL, title_en text,
  short_desc_pl text, short_desc_en text, description_pl text, description_en text,
  challenge_pl text, challenge_en text, solution_pl text, solution_en text, result_pl text, result_en text,
  seo_title_pl text, seo_title_en text, seo_desc_pl text, seo_desc_en text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.vv_project_category_assignments (
  project_id uuid NOT NULL REFERENCES public.vv_projects(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.vv_project_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);
CREATE TABLE IF NOT EXISTS public.vv_project_technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.vv_projects(id) ON DELETE CASCADE,
  name text NOT NULL, color text NOT NULL DEFAULT '#6366F1', icon text, order_index integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS public.vv_project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.vv_projects(id) ON DELETE CASCADE,
  path text NOT NULL, type text NOT NULL DEFAULT 'screenshot', alt_pl text, alt_en text,
  order_index integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vv_service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE,
  name_pl text NOT NULL, name_en text, order_index integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.vv_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  featured boolean NOT NULL DEFAULT false, order_index integer NOT NULL DEFAULT 0, icon text, image_url text,
  price numeric(10,2), price_unit text NOT NULL DEFAULT 'PLN', price_from boolean NOT NULL DEFAULT false, duration text,
  title_pl text NOT NULL, title_en text, short_desc_pl text, short_desc_en text, description_pl text, description_en text,
  features_pl text[] NOT NULL DEFAULT '{}', features_en text[] NOT NULL DEFAULT '{}',
  meta_title_pl text, meta_title_en text, meta_desc_pl text, meta_desc_en text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.vv_service_category_assignments (
  service_id uuid NOT NULL REFERENCES public.vv_services(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.vv_service_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.vv_faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, name_pl text NOT NULL, name_en text,
  order_index integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.vv_faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), category_id uuid REFERENCES public.vv_faq_categories(id) ON DELETE SET NULL,
  question_pl text NOT NULL, question_en text, answer_pl text NOT NULL, answer_en text,
  order_index integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vv_newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, source text, tags text[] NOT NULL DEFAULT '{}',
  token text NOT NULL UNIQUE, is_active boolean NOT NULL DEFAULT true, language text NOT NULL DEFAULT 'pl',
  subscribed_at timestamptz NOT NULL DEFAULT now(), unsubscribed_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), full_name text NOT NULL, email text NOT NULL, phone text,
  subject text NOT NULL, message text NOT NULL, language text NOT NULL DEFAULT 'pl', client_ip text,
  status text NOT NULL DEFAULT 'new', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key text PRIMARY KEY, window_started_at timestamptz NOT NULL DEFAULT now(), request_count integer NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.vv_set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.vv_set_published_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status <> 'published') THEN NEW.published_at = COALESCE(NEW.published_at, now()); END IF; RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.vv_blog_increment_views(p_post_slug text, p_client_ip text) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE post_id_value uuid; current_views integer;
BEGIN
  SELECT id INTO post_id_value FROM vv_blog_posts WHERE slug = p_post_slug AND status = 'published';
  IF post_id_value IS NULL THEN RETURN NULL; END IF;
  INSERT INTO vv_blog_post_views(post_id, client_ip) VALUES(post_id_value, p_client_ip) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN SELECT views_count INTO current_views FROM vv_blog_posts WHERE id = post_id_value; RETURN current_views; END IF;
  UPDATE vv_blog_posts SET views_count = views_count + 1 WHERE id = post_id_value RETURNING views_count INTO current_views; RETURN current_views;
END $$;

CREATE TRIGGER vv_blog_posts_updated_at BEFORE UPDATE ON public.vv_blog_posts FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();
CREATE TRIGGER vv_blog_posts_published_at BEFORE INSERT OR UPDATE ON public.vv_blog_posts FOR EACH ROW EXECUTE FUNCTION public.vv_set_published_at();
CREATE TRIGGER vv_page_seo_updated_at BEFORE UPDATE ON public.vv_page_seo FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();
CREATE TRIGGER vv_page_sections_updated_at BEFORE UPDATE ON public.vv_page_sections FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();
CREATE TRIGGER vv_legal_documents_updated_at BEFORE UPDATE ON public.vv_legal_documents FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();
CREATE TRIGGER vv_projects_updated_at BEFORE UPDATE ON public.vv_projects FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();
CREATE TRIGGER vv_services_updated_at BEFORE UPDATE ON public.vv_services FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();
CREATE TRIGGER vv_faq_items_updated_at BEFORE UPDATE ON public.vv_faq_items FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();
CREATE TRIGGER vv_newsletter_subscribers_updated_at BEFORE UPDATE ON public.vv_newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();
CREATE TRIGGER messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_vv_blog_posts_public ON public.vv_blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_vv_projects_public ON public.vv_projects(order_index) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_vv_services_public ON public.vv_services(order_index) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_vv_faq_items_public ON public.vv_faq_items(category_id, order_index) WHERE is_active;

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.vv_site_settings, public.vv_page_seo, public.vv_page_sections, public.vv_legal_documents,
  public.vv_blog_categories, public.vv_blog_posts, public.vv_blog_post_categories,
  public.vv_project_categories, public.vv_projects, public.vv_project_category_assignments, public.vv_project_technologies, public.vv_project_images,
  public.vv_service_categories, public.vv_services, public.vv_service_category_assignments,
  public.vv_faq_categories, public.vv_faq_items TO anon;

DO $$
DECLARE
  api_role text;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['vezvision_api', 'vezvision_lab_api'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', api_role);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO %I', api_role);
      EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO %I', api_role);
    END IF;
  END LOOP;
END $$;

ALTER TABLE public.vv_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_project_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_service_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_settings_read ON public.vv_site_settings FOR SELECT TO anon USING (is_public);
CREATE POLICY page_seo_read ON public.vv_page_seo FOR SELECT TO anon USING (is_public);
CREATE POLICY page_sections_read ON public.vv_page_sections FOR SELECT TO anon USING (is_public);
CREATE POLICY legal_documents_read ON public.vv_legal_documents FOR SELECT TO anon USING (is_published);
CREATE POLICY blog_categories_read ON public.vv_blog_categories FOR SELECT TO anon USING (true);
CREATE POLICY blog_posts_read ON public.vv_blog_posts FOR SELECT TO anon USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY blog_post_categories_read ON public.vv_blog_post_categories FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.vv_blog_posts p WHERE p.id = post_id AND p.status = 'published' AND (p.published_at IS NULL OR p.published_at <= now())));
CREATE POLICY project_categories_read ON public.vv_project_categories FOR SELECT TO anon USING (true);
CREATE POLICY projects_read ON public.vv_projects FOR SELECT TO anon USING (status = 'published');
CREATE POLICY project_assignments_read ON public.vv_project_category_assignments FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.vv_projects p WHERE p.id = project_id AND p.status = 'published'));
CREATE POLICY project_technologies_read ON public.vv_project_technologies FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.vv_projects p WHERE p.id = project_id AND p.status = 'published'));
CREATE POLICY project_images_read ON public.vv_project_images FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.vv_projects p WHERE p.id = project_id AND p.status = 'published'));
CREATE POLICY service_categories_read ON public.vv_service_categories FOR SELECT TO anon USING (true);
CREATE POLICY services_read ON public.vv_services FOR SELECT TO anon USING (status = 'active');
CREATE POLICY service_assignments_read ON public.vv_service_category_assignments FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.vv_services s WHERE s.id = service_id AND s.status = 'active'));
CREATE POLICY faq_categories_read ON public.vv_faq_categories FOR SELECT TO anon USING (is_active);
CREATE POLICY faq_items_read ON public.vv_faq_items FOR SELECT TO anon USING (is_active);

REVOKE ALL ON public.messages, public.vv_newsletter_subscribers, public.rate_limit_buckets, public.vv_blog_post_views FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.vv_blog_increment_views(text, text) FROM PUBLIC, anon;
COMMIT;
