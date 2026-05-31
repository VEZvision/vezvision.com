-- 20260203 - Security hardening for RLS and admin tables

-- ============================================================================
-- 1. Tighten RLS for admin_roles (only real admins can mutate)
-- ============================================================================

ALTER TABLE IF EXISTS public.admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.admin_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.admin_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.admin_roles;

CREATE POLICY "Admin manage roles" ON public.admin_roles
  FOR ALL TO authenticated
  USING (
    (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  )
  WITH CHECK (
    (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  );

-- ============================================================================
-- 2. Tighten RLS for audit_logs (system/admin only)
-- ============================================================================

ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "System or admin insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  );

-- ============================================================================
-- 3. Project task attachments/comments - only admins/service_role can insert
-- ============================================================================

ALTER TABLE IF EXISTS public.project_task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert access for attachments" ON public.project_task_attachments;
DROP POLICY IF EXISTS "Enable insert access for all authenticated users" ON public.project_task_comments;

CREATE POLICY "Project task attachments insert (admin only)" ON public.project_task_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  );

CREATE POLICY "Project task comments insert (admin only)" ON public.project_task_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  );

-- ============================================================================
-- 4. Tighten broad *Manage All* policies on core CRM/PM tables
--    Only admins (admin_users) or service_role should have full CRUD.
--    Client-facing read policies (Client View / Client Access) are kept.
-- ============================================================================

-- Invoices
DROP POLICY IF EXISTS "Invoices Manage All" ON public.invoices;

CREATE POLICY "Invoices Admin Manage" ON public.invoices
  FOR ALL TO authenticated
  USING (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  )
  WITH CHECK (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  );

-- Leads
DROP POLICY IF EXISTS "Leads Manage All" ON public.leads;

CREATE POLICY "Leads Admin Manage" ON public.leads
  FOR ALL TO authenticated
  USING (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  )
  WITH CHECK (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  );

-- Newsletter campaigns
DROP POLICY IF EXISTS "Newsletter Campaigns Manage All" ON public.newsletter_campaigns;

CREATE POLICY "Newsletter Campaigns Admin Manage" ON public.newsletter_campaigns
  FOR ALL TO authenticated
  USING (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  )
  WITH CHECK (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  );

-- Project briefs
DROP POLICY IF EXISTS "Project Briefs Admin Manage" ON public.project_briefs;

CREATE POLICY "Project Briefs Admin Manage" ON public.project_briefs
  FOR ALL TO authenticated
  USING (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  )
  WITH CHECK (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  );

-- Project files
DROP POLICY IF EXISTS "Project Files Admin Manage" ON public.project_files;

CREATE POLICY "Project Files Admin Manage" ON public.project_files
  FOR ALL TO authenticated
  USING (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  )
  WITH CHECK (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  );

-- Project tasks
DROP POLICY IF EXISTS "Project Tasks Admin Manage" ON public.project_tasks;

CREATE POLICY "Project Tasks Admin Manage" ON public.project_tasks
  FOR ALL TO authenticated
  USING (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  )
  WITH CHECK (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  );

-- Projects
DROP POLICY IF EXISTS "Projects Admin Manage" ON public.projects;

CREATE POLICY "Projects Admin Manage" ON public.projects
  FOR ALL TO authenticated
  USING (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  )
  WITH CHECK (
    (select auth.role()) = 'service_role'
    OR (SELECT COUNT(*) FROM public.admin_users WHERE id = (select auth.uid())) = 1
  );

-- ============================================================================
-- 5. Minor RLS performance improvement (auth_rls_initplan) for blocked_ips
--    Use (select auth.uid()) form as recommended.
-- ============================================================================

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.blocked_ips;

CREATE POLICY "Enable all access for authenticated users" ON public.blocked_ips
  FOR ALL TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

