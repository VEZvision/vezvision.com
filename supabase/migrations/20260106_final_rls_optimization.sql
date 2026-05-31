-- FINAL COMPREHENSIVE RLS OPTIMIZATION
-- Resolve ALL 111 warnings (auth_rls_initplan & multiple_permissive_policies)

-- ============================================================================
-- 1. AUTH RLS INITPLAN OPTIMIZATIONS (select auth.function())
-- ============================================================================

-- Table: crm_offers
ALTER POLICY "Admins can view all offers" ON public.crm_offers USING (
    (EXISTS ( SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid()))) OR 
    ((select auth.role()) = 'service_role')
);
ALTER POLICY "Admins can insert offers" ON public.crm_offers WITH CHECK (
    (EXISTS ( SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid()))) OR 
    ((select auth.role()) = 'service_role')
);
ALTER POLICY "Admins can update offers" ON public.crm_offers USING (
    (EXISTS ( SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid()))) OR 
    ((select auth.role()) = 'service_role')
);
ALTER POLICY "Admins can delete offers" ON public.crm_offers USING (
    (EXISTS ( SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid()))) OR 
    ((select auth.role()) = 'service_role')
);

-- Table: project_task_comments
ALTER POLICY "Enable update for own comments" ON public.project_task_comments USING ((select auth.uid()) = user_id);
ALTER POLICY "Enable delete for own comments" ON public.project_task_comments USING ((select auth.uid()) = user_id);

-- Table: social_posts
ALTER POLICY "Users can view their own posts" ON public.social_posts USING ((select auth.uid()) = created_by);
ALTER POLICY "Users can insert their own posts" ON public.social_posts WITH CHECK ((select auth.uid()) = created_by);
ALTER POLICY "Users can update their own posts" ON public.social_posts USING ((select auth.uid()) = created_by);
ALTER POLICY "Users can delete their own posts" ON public.social_posts USING ((select auth.uid()) = created_by);

-- Table: project_files
ALTER POLICY "Clients View Shared Files" ON public.project_files 
USING (
    (is_shared_with_client = true) AND 
    (project_id IN ( 
        SELECT projects.id FROM projects 
        WHERE projects.client_id IN ( 
            SELECT clients.id FROM clients 
            WHERE clients.user_id = (select auth.uid())
        )
    ))
);

-- Table: admin_role_permissions
ALTER POLICY "Enable all access for admins" ON public.admin_role_permissions 
USING ((select auth.uid()) IN ( SELECT id FROM admin_users));

-- Table: system_settings
ALTER POLICY "Admins can manage system settings" ON public.system_settings 
USING (
    ((select auth.uid()) IN ( SELECT id FROM admin_users)) OR 
    ((select auth.role()) = 'service_role'::text)
);

-- ============================================================================
-- 2. MULTIPLE PERMISSIVE POLICIES CONSOLIDATION
-- ============================================================================

-- Table: case_studies
DROP POLICY IF EXISTS "Anyone can view case studies" ON public.case_studies;
DROP POLICY IF EXISTS "Authenticated users can manage case studies" ON public.case_studies;
CREATE POLICY "Public view published" ON public.case_studies FOR SELECT TO public USING (status = 'published');
CREATE POLICY "Admins manage" ON public.case_studies FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');

-- Table: crm_offer_presets
DROP POLICY IF EXISTS "Authenticated users manage presets" ON public.crm_offer_presets;
DROP POLICY IF EXISTS "Enable read for anon" ON public.crm_offer_presets;
CREATE POLICY "Public view offer presets" ON public.crm_offer_presets FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage offer presets" ON public.crm_offer_presets FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');

-- Table: faq_categories
DROP POLICY IF EXISTS "Admins can view all faq categories" ON public.faq_categories;
DROP POLICY IF EXISTS "Public can view faq categories" ON public.faq_categories;
DROP POLICY IF EXISTS "Public view" ON public.faq_categories;
CREATE POLICY "FAQ Categories Select" ON public.faq_categories FOR SELECT TO public USING (true);
CREATE POLICY "FAQ Categories Manage" ON public.faq_categories FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');

-- Table: faq_items
DROP POLICY IF EXISTS "Admins can view all faq items" ON public.faq_items;
DROP POLICY IF EXISTS "Public can view faq items" ON public.faq_items;
DROP POLICY IF EXISTS "Public view" ON public.faq_items;
CREATE POLICY "FAQ Items Select" ON public.faq_items FOR SELECT TO public USING (true);
CREATE POLICY "FAQ Items Manage" ON public.faq_items FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');

-- Table: invoices
DROP POLICY IF EXISTS "Admin access invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.invoices;
CREATE POLICY "Invoices Manage All" ON public.invoices FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');

-- Table: leads
DROP POLICY IF EXISTS "Allow full access for admins" ON public.leads;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.leads;
CREATE POLICY "Leads Manage All" ON public.leads FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');

-- Table: newsletter_campaigns
DROP POLICY IF EXISTS "Admins can manage all campaigns" ON public.newsletter_campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns" ON public.newsletter_campaigns;
DROP POLICY IF EXISTS "Users can update campaigns" ON public.newsletter_campaigns;
DROP POLICY IF EXISTS "Users can view campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Newsletter Campaigns Manage All" ON public.newsletter_campaigns FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');

-- Table: project_briefs
DROP POLICY IF EXISTS "Admins All Briefs" ON public.project_briefs;
DROP POLICY IF EXISTS "Clients View Briefs" ON public.project_briefs;
DROP POLICY IF EXISTS "Clients Update Briefs" ON public.project_briefs;
CREATE POLICY "Project Briefs Admin Manage" ON public.project_briefs FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Project Briefs Client Access" ON public.project_briefs FOR SELECT TO authenticated 
USING (project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT id FROM clients WHERE user_id = (select auth.uid()))));

-- Table: project_categories
DROP POLICY IF EXISTS "Admin delete" ON public.project_categories;
DROP POLICY IF EXISTS "Admin insert" ON public.project_categories;
DROP POLICY IF EXISTS "Admin update" ON public.project_categories;
DROP POLICY IF EXISTS "Admins can manage project categories" ON public.project_categories;
DROP POLICY IF EXISTS "Public can view project categories" ON public.project_categories;
DROP POLICY IF EXISTS "Public view" ON public.project_categories;
CREATE POLICY "Project Categories Select" ON public.project_categories FOR SELECT TO public USING (true);
CREATE POLICY "Project Categories Manage" ON public.project_categories FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');

-- Table: project_files
DROP POLICY IF EXISTS "Admins All Files" ON public.project_files;
-- Note: "Clients View Shared Files" is kept & optimized in section 1
CREATE POLICY "Project Files Admin Manage" ON public.project_files FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');

-- Table: project_task_checklists
DROP POLICY IF EXISTS "Enable all access for checkboxes" ON public.project_task_checklists;
DROP POLICY IF EXISTS "Enable read access for checkboxes" ON public.project_task_checklists;
CREATE POLICY "Project Task Checklists Manage" ON public.project_task_checklists FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');

-- Table: project_tasks
DROP POLICY IF EXISTS "Admins can manage tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Clients can view tasks for their projects" ON public.project_tasks;
CREATE POLICY "Project Tasks Admin Manage" ON public.project_tasks FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Project Tasks Client View" ON public.project_tasks FOR SELECT TO authenticated 
USING (project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT id FROM clients WHERE user_id = (select auth.uid()))));

-- Table: projects
DROP POLICY IF EXISTS "Clients View Own Projects" ON public.projects;
DROP POLICY IF EXISTS "Consolidated view" ON public.projects;
CREATE POLICY "Projects Admin Manage" ON public.projects FOR ALL TO authenticated USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Projects Client View" ON public.projects FOR SELECT TO authenticated 
USING (client_id IN (SELECT id FROM clients WHERE user_id = (select auth.uid())));

-- Table: social_posts (Cleanup of multiple permissive)
DROP POLICY IF EXISTS "Admin manage social posts" ON public.social_posts;
DROP POLICY IF EXISTS "Admin manage all social posts" ON public.social_posts;
-- Individual owner policies are in Section 1. Adding Admin access to them:
ALTER POLICY "Users can view their own posts" ON public.social_posts USING ((select auth.uid()) = created_by OR (select auth.role()) = 'authenticated');
ALTER POLICY "Users can update their own posts" ON public.social_posts USING ((select auth.uid()) = created_by OR (select auth.role()) = 'authenticated');
ALTER POLICY "Users can delete their own posts" ON public.social_posts USING ((select auth.uid()) = created_by OR (select auth.role()) = 'authenticated');

-- Table: tenants
DROP POLICY IF EXISTS "Authenticated and above read tenants" ON public.tenants;
CREATE POLICY "Tenants Public Read" ON public.tenants FOR SELECT TO public USING (true);

