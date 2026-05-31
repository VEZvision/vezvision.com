-- =============================================================================
-- 20260328 — VezVision Fresh Schema
-- Drops all legacy content tables, creates clean vv_* schema for vezcore CMS
-- =============================================================================

-- =============================================================================
-- PART 1: DROP LEGACY TABLES
-- Order matters — children before parents (FK constraints)
-- =============================================================================

-- Blog (legacy)
DROP TABLE IF EXISTS public.blog_comments CASCADE;
DROP TABLE IF EXISTS public.blog_post_categories CASCADE;
DROP TABLE IF EXISTS public.blog_post_translations CASCADE;
DROP TABLE IF EXISTS public.blog_category_translations CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.blog_categories CASCADE;

-- Portfolio (legacy)
DROP TABLE IF EXISTS public.project_technologies CASCADE;
DROP TABLE IF EXISTS public.project_images CASCADE;
DROP TABLE IF EXISTS public.project_translations CASCADE;
DROP TABLE IF EXISTS public.project_categories CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;

-- Services (legacy)
DROP TABLE IF EXISTS public.service_category_assignments CASCADE;
DROP TABLE IF EXISTS public.service_category_translations CASCADE;
DROP TABLE IF EXISTS public.service_translations CASCADE;
DROP TABLE IF EXISTS public.service_categories CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;

-- CRM (legacy — old admin panel)
DROP TABLE IF EXISTS public.crm_activities CASCADE;
DROP TABLE IF EXISTS public.crm_reminders CASCADE;
DROP TABLE IF EXISTS public.crm_offers CASCADE;
DROP TABLE IF EXISTS public.crm_offer_presets CASCADE;
DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;

-- FAQ (legacy)
DROP TABLE IF EXISTS public.faq_item_translations CASCADE;
DROP TABLE IF EXISTS public.faq_items CASCADE;
DROP TABLE IF EXISTS public.faq_category_translations CASCADE;
DROP TABLE IF EXISTS public.faq_categories CASCADE;

-- Old admin auth (legacy — replaced by vezcore profiles)
DROP TABLE IF EXISTS public.admin_role_permissions CASCADE;
DROP TABLE IF EXISTS public.admin_permissions CASCADE;
DROP TABLE IF EXISTS public.admin_roles CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Old audit (legacy — vezcore has its own audit_log)
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- =============================================================================
-- PART 2: DROP LEGACY FUNCTIONS
-- =============================================================================

DROP FUNCTION IF EXISTS public.is_admin_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.set_published_at() CASCADE;

-- =============================================================================
-- PART 3: SHARED UTILITIES
-- =============================================================================

-- Standard updated_at trigger function
CREATE OR REPLACE FUNCTION public.vv_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Admin check — reads from profiles table in THIS database (vezvisionWEB)
-- vezvision_web uses its own profiles table; vezcore writes role there via service_role
CREATE OR REPLACE FUNCTION public.vv_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
  );
END;
$$;

-- =============================================================================
-- PART 4: BLOG
-- =============================================================================

CREATE TABLE public.vv_blog_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name_pl     TEXT NOT NULL,
  name_en     TEXT,
  color       TEXT NOT NULL DEFAULT '#3B82F6',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vv_blog_posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT NOT NULL UNIQUE,
  status         TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'published', 'archived')),
  featured       BOOLEAN NOT NULL DEFAULT false,
  featured_image TEXT,
  reading_time   INTEGER NOT NULL DEFAULT 0,
  views_count    INTEGER NOT NULL DEFAULT 0,
  published_at   TIMESTAMPTZ,
  author_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- i18n
  title_pl       TEXT NOT NULL,
  title_en       TEXT,
  excerpt_pl     TEXT,
  excerpt_en     TEXT,
  content_pl     TEXT NOT NULL DEFAULT '',
  content_en     TEXT,
  meta_title_pl  TEXT,
  meta_title_en  TEXT,
  meta_desc_pl   TEXT,
  meta_desc_en   TEXT,
  tags_pl        TEXT[] NOT NULL DEFAULT '{}',
  tags_en        TEXT[] NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-set published_at when status changes to 'published'
CREATE OR REPLACE FUNCTION public.vv_blog_set_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status <> 'published') THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER vv_blog_posts_published_at
  BEFORE INSERT OR UPDATE ON public.vv_blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.vv_blog_set_published_at();

CREATE TRIGGER vv_blog_posts_updated_at
  BEFORE UPDATE ON public.vv_blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();

-- Post ↔ Category (M:N)
CREATE TABLE public.vv_blog_post_categories (
  post_id     UUID NOT NULL REFERENCES public.vv_blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.vv_blog_categories(id) ON DELETE CASCADE,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (post_id, category_id)
);

-- Indexes
CREATE INDEX idx_vv_blog_posts_status      ON public.vv_blog_posts(status);
CREATE INDEX idx_vv_blog_posts_published   ON public.vv_blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_vv_blog_posts_featured    ON public.vv_blog_posts(featured) WHERE featured = true;
CREATE INDEX idx_vv_blog_posts_slug        ON public.vv_blog_posts(slug);
CREATE INDEX idx_vv_blog_categories_slug   ON public.vv_blog_categories(slug);

-- RLS
ALTER TABLE public.vv_blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_blog_post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vv_blog_categories_public_read" ON public.vv_blog_categories
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "vv_blog_categories_admin_all" ON public.vv_blog_categories
  FOR ALL TO authenticated
  USING (vv_is_admin()) WITH CHECK (vv_is_admin());

CREATE POLICY "vv_blog_posts_public_read" ON public.vv_blog_posts
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "vv_blog_posts_admin_all" ON public.vv_blog_posts
  FOR ALL TO authenticated
  USING (vv_is_admin()) WITH CHECK (vv_is_admin());

CREATE POLICY "vv_blog_post_categories_public_read" ON public.vv_blog_post_categories
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vv_blog_posts
      WHERE id = post_id AND status = 'published'
    )
  );

CREATE POLICY "vv_blog_post_categories_admin_all" ON public.vv_blog_post_categories
  FOR ALL TO authenticated
  USING (vv_is_admin()) WITH CHECK (vv_is_admin());

-- Public grants
GRANT SELECT ON public.vv_blog_posts TO anon;
GRANT SELECT ON public.vv_blog_categories TO anon;
GRANT SELECT ON public.vv_blog_post_categories TO anon;

-- =============================================================================
-- PART 5: PORTFOLIO
-- =============================================================================

CREATE TABLE public.vv_project_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name_pl     TEXT NOT NULL,
  name_en     TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vv_projects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT NOT NULL UNIQUE,
  status         TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'published', 'archived')),
  featured       BOOLEAN NOT NULL DEFAULT false,
  order_index    INTEGER NOT NULL DEFAULT 0,
  cover_image    TEXT,
  demo_url       TEXT,
  github_url     TEXT,
  client_name    TEXT,
  -- i18n
  title_pl       TEXT NOT NULL,
  title_en       TEXT,
  short_desc_pl  TEXT,
  short_desc_en  TEXT,
  description_pl TEXT,
  description_en TEXT,
  -- case study
  challenge_pl   TEXT,
  challenge_en   TEXT,
  solution_pl    TEXT,
  solution_en    TEXT,
  result_pl      TEXT,
  result_en      TEXT,
  -- SEO
  seo_title_pl   TEXT,
  seo_title_en   TEXT,
  seo_desc_pl    TEXT,
  seo_desc_en    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER vv_projects_updated_at
  BEFORE UPDATE ON public.vv_projects
  FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();

-- Project ↔ Category (M:N)
CREATE TABLE public.vv_project_category_assignments (
  project_id  UUID NOT NULL REFERENCES public.vv_projects(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.vv_project_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);

-- Technologies used in project
CREATE TABLE public.vv_project_technologies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.vv_projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#6366F1',
  icon        TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Project image gallery
CREATE TABLE public.vv_project_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.vv_projects(id) ON DELETE CASCADE,
  path        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'screenshot'
                CHECK (type IN ('screenshot', 'mockup', 'logo', 'banner')),
  alt_pl      TEXT,
  alt_en      TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_vv_projects_status    ON public.vv_projects(status);
CREATE INDEX idx_vv_projects_featured  ON public.vv_projects(featured) WHERE featured = true;
CREATE INDEX idx_vv_projects_order     ON public.vv_projects(order_index);
CREATE INDEX idx_vv_projects_slug      ON public.vv_projects(slug);
CREATE INDEX idx_vv_project_images_project ON public.vv_project_images(project_id, order_index);
CREATE INDEX idx_vv_project_tech_project   ON public.vv_project_technologies(project_id, order_index);

-- RLS
ALTER TABLE public.vv_project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_project_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vv_project_categories_public_read" ON public.vv_project_categories
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "vv_project_categories_admin_all" ON public.vv_project_categories
  FOR ALL TO authenticated
  USING (vv_is_admin()) WITH CHECK (vv_is_admin());

CREATE POLICY "vv_projects_public_read" ON public.vv_projects
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "vv_projects_admin_all" ON public.vv_projects
  FOR ALL TO authenticated
  USING (vv_is_admin()) WITH CHECK (vv_is_admin());

CREATE POLICY "vv_project_assignments_public_read" ON public.vv_project_category_assignments
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vv_projects
      WHERE id = project_id AND status = 'published'
    )
  );

CREATE POLICY "vv_project_assignments_admin_all" ON public.vv_project_category_assignments
  FOR ALL TO authenticated
  USING (vv_is_admin()) WITH CHECK (vv_is_admin());

CREATE POLICY "vv_project_technologies_public_read" ON public.vv_project_technologies
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vv_projects
      WHERE id = project_id AND status = 'published'
    )
  );

CREATE POLICY "vv_project_technologies_admin_all" ON public.vv_project_technologies
  FOR ALL TO authenticated
  USING (vv_is_admin()) WITH CHECK (vv_is_admin());

CREATE POLICY "vv_project_images_public_read" ON public.vv_project_images
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vv_projects
      WHERE id = project_id AND status = 'published'
    )
  );

CREATE POLICY "vv_project_images_admin_all" ON public.vv_project_images
  FOR ALL TO authenticated
  USING (vv_is_admin()) WITH CHECK (vv_is_admin());

-- Public grants
GRANT SELECT ON public.vv_projects TO anon;
GRANT SELECT ON public.vv_project_categories TO anon;
GRANT SELECT ON public.vv_project_category_assignments TO anon;
GRANT SELECT ON public.vv_project_technologies TO anon;
GRANT SELECT ON public.vv_project_images TO anon;

-- =============================================================================
-- PART 6: SERVICES
-- =============================================================================

CREATE TABLE public.vv_service_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name_pl     TEXT NOT NULL,
  name_en     TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vv_services (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT NOT NULL UNIQUE,
  status         TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'active', 'archived')),
  featured       BOOLEAN NOT NULL DEFAULT false,
  order_index    INTEGER NOT NULL DEFAULT 0,
  icon           TEXT,
  image_url      TEXT,
  price          NUMERIC(10, 2),
  price_unit     TEXT NOT NULL DEFAULT 'PLN',
  price_from     BOOLEAN NOT NULL DEFAULT false,
  duration       TEXT,
  -- i18n
  title_pl       TEXT NOT NULL,
  title_en       TEXT,
  short_desc_pl  TEXT,
  short_desc_en  TEXT,
  description_pl TEXT,
  description_en TEXT,
  features_pl    TEXT[] NOT NULL DEFAULT '{}',
  features_en    TEXT[] NOT NULL DEFAULT '{}',
  -- SEO
  meta_title_pl  TEXT,
  meta_title_en  TEXT,
  meta_desc_pl   TEXT,
  meta_desc_en   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER vv_services_updated_at
  BEFORE UPDATE ON public.vv_services
  FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();

-- Service ↔ Category (M:N)
CREATE TABLE public.vv_service_category_assignments (
  service_id  UUID NOT NULL REFERENCES public.vv_services(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.vv_service_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, category_id)
);

-- Indexes
CREATE INDEX idx_vv_services_status   ON public.vv_services(status);
CREATE INDEX idx_vv_services_featured ON public.vv_services(featured) WHERE featured = true;
CREATE INDEX idx_vv_services_order    ON public.vv_services(order_index);
CREATE INDEX idx_vv_services_slug     ON public.vv_services(slug);

-- RLS
ALTER TABLE public.vv_service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vv_service_category_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vv_service_categories_public_read" ON public.vv_service_categories
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "vv_service_categories_admin_all" ON public.vv_service_categories
  FOR ALL TO authenticated
  USING (vv_is_admin()) WITH CHECK (vv_is_admin());

CREATE POLICY "vv_services_public_read" ON public.vv_services
  FOR SELECT TO anon, authenticated USING (status = 'active');

CREATE POLICY "vv_services_admin_all" ON public.vv_services
  FOR ALL TO authenticated
  USING (vv_is_admin()) WITH CHECK (vv_is_admin());

CREATE POLICY "vv_service_assignments_public_read" ON public.vv_service_category_assignments
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vv_services
      WHERE id = service_id AND status = 'active'
    )
  );

CREATE POLICY "vv_service_assignments_admin_all" ON public.vv_service_category_assignments
  FOR ALL TO authenticated
  USING (vv_is_admin()) WITH CHECK (vv_is_admin());

-- Public grants
GRANT SELECT ON public.vv_services TO anon;
GRANT SELECT ON public.vv_service_categories TO anon;
GRANT SELECT ON public.vv_service_category_assignments TO anon;

-- =============================================================================
-- PART 7: REALTIME (optional — for live preview in vezcore editor)
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.vv_blog_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vv_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vv_services;
