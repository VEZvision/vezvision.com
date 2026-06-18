-- 1. rate_limit_buckets: add explicit service_role policy for clarity
DROP POLICY IF EXISTS rate_limit_buckets_service_role_all ON public.rate_limit_buckets;
CREATE POLICY rate_limit_buckets_service_role_all
  ON public.rate_limit_buckets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. vv_faq_items: consolidate multiple permissive SELECT policies into one
DROP POLICY IF EXISTS vv_faq_items_admin_all ON public.vv_faq_items;
DROP POLICY IF EXISTS vv_faq_items_public_read ON public.vv_faq_items;

CREATE POLICY vv_faq_items_read
  ON public.vv_faq_items
  FOR SELECT
  TO anon, authenticated
  USING ((SELECT vv_is_admin() AS vv_is_admin) OR (is_active = true));

CREATE POLICY vv_faq_items_admin_insert
  ON public.vv_faq_items
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT vv_is_admin() AS vv_is_admin));

CREATE POLICY vv_faq_items_admin_update
  ON public.vv_faq_items
  FOR UPDATE
  TO authenticated
  USING ((SELECT vv_is_admin() AS vv_is_admin))
  WITH CHECK ((SELECT vv_is_admin() AS vv_is_admin));

CREATE POLICY vv_faq_items_admin_delete
  ON public.vv_faq_items
  FOR DELETE
  TO authenticated
  USING ((SELECT vv_is_admin() AS vv_is_admin));

-- 3. vv_faq_categories: same consolidation
DROP POLICY IF EXISTS vv_faq_categories_admin_all ON public.vv_faq_categories;
DROP POLICY IF EXISTS vv_faq_categories_public_read ON public.vv_faq_categories;

CREATE POLICY vv_faq_categories_read
  ON public.vv_faq_categories
  FOR SELECT
  TO anon, authenticated
  USING ((SELECT vv_is_admin() AS vv_is_admin) OR (is_active = true));

CREATE POLICY vv_faq_categories_admin_insert
  ON public.vv_faq_categories
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT vv_is_admin() AS vv_is_admin));

CREATE POLICY vv_faq_categories_admin_update
  ON public.vv_faq_categories
  FOR UPDATE
  TO authenticated
  USING ((SELECT vv_is_admin() AS vv_is_admin))
  WITH CHECK ((SELECT vv_is_admin() AS vv_is_admin));

CREATE POLICY vv_faq_categories_admin_delete
  ON public.vv_faq_categories
  FOR DELETE
  TO authenticated
  USING ((SELECT vv_is_admin() AS vv_is_admin));

-- 4. Remove confirmed-unused indexes on website tables
DROP INDEX IF EXISTS public.vv_faq_items_category_id_idx;
DROP INDEX IF EXISTS public.idx_vv_faq_items_active_order;
DROP INDEX IF EXISTS public.idx_vv_faq_items_created_by;
DROP INDEX IF EXISTS public.idx_vv_faq_categories_created_by;
DROP INDEX IF EXISTS public.idx_vv_blog_posts_author_id;
DROP INDEX IF EXISTS public.idx_vv_blog_posts_created_by;
DROP INDEX IF EXISTS public.idx_vv_projects_created_by;
DROP INDEX IF EXISTS public.idx_vv_services_created_by;
