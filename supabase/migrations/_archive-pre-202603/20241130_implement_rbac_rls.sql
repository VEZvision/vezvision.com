-- Add is_active to admin_users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'is_active') THEN
        ALTER TABLE public.admin_users ADD COLUMN is_active boolean DEFAULT true;
    END IF;
END $$;

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION public.check_permission(required_permission text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users au
    JOIN public.admin_roles ar ON au.role_id = ar.id
    JOIN public.admin_role_permissions arp ON ar.id = arp.role_id
    JOIN public.admin_permissions ap ON arp.permission_id = ap.id
    WHERE au.id = auth.uid()
    AND au.is_active = true
    AND ap.code = required_permission
  );
END;
$$;

-- Update is_admin_user to use the new table
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
    AND is_active = true
  );
END;
$$;

-- RLS Policies

-- Blog Posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
CREATE POLICY "Public can view published posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins can view all posts" ON public.blog_posts;
CREATE POLICY "Admins can view all posts" ON public.blog_posts
  FOR SELECT USING (public.check_permission('blog.view'));

DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
CREATE POLICY "Admins can insert posts" ON public.blog_posts
  FOR INSERT WITH CHECK (public.check_permission('blog.create'));

DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
CREATE POLICY "Admins can update posts" ON public.blog_posts
  FOR UPDATE USING (public.check_permission('blog.edit'));

DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;
CREATE POLICY "Admins can delete posts" ON public.blog_posts
  FOR DELETE USING (public.check_permission('blog.delete'));


-- Projects (Portfolio)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
CREATE POLICY "Public can view projects" ON public.projects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins can insert projects" ON public.projects
  FOR INSERT WITH CHECK (public.check_permission('portfolio.create'));

DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
CREATE POLICY "Admins can update projects" ON public.projects
  FOR UPDATE USING (public.check_permission('portfolio.edit'));

DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects" ON public.projects
  FOR DELETE USING (public.check_permission('portfolio.delete'));


-- Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.check_permission('users.view')); -- Or specific audit.view permission

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true); -- Ideally restricted to authenticated users, but for now true to allow logging from server functions if needed, or auth.uid() is not null


-- Blocked IPs
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view blocked ips" ON public.blocked_ips;
CREATE POLICY "Admins can view blocked ips" ON public.blocked_ips
  FOR SELECT USING (public.check_permission('users.view'));

DROP POLICY IF EXISTS "Admins can manage blocked ips" ON public.blocked_ips;
CREATE POLICY "Admins can manage blocked ips" ON public.blocked_ips
  FOR ALL USING (public.check_permission('users.manage_roles')); -- Using manage_roles as proxy for high level security



-- Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view services" ON public.services;
CREATE POLICY "Public can view services" ON public.services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert services" ON public.services;
CREATE POLICY "Admins can insert services" ON public.services
  FOR INSERT WITH CHECK (public.check_permission('services.create'));

DROP POLICY IF EXISTS "Admins can update services" ON public.services;
CREATE POLICY "Admins can update services" ON public.services
  FOR UPDATE USING (public.check_permission('services.edit'));

DROP POLICY IF EXISTS "Admins can delete services" ON public.services;
CREATE POLICY "Admins can delete services" ON public.services
  FOR DELETE USING (public.check_permission('services.delete'));


-- Contact Messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view messages" ON public.contact_messages;
CREATE POLICY "Admins can view messages" ON public.contact_messages
  FOR SELECT USING (public.check_permission('messages.view'));

DROP POLICY IF EXISTS "Admins can update messages" ON public.contact_messages;
CREATE POLICY "Admins can update messages" ON public.contact_messages
  FOR UPDATE USING (public.check_permission('messages.edit')); -- Assuming edit permission covers status update

DROP POLICY IF EXISTS "Admins can delete messages" ON public.contact_messages;
CREATE POLICY "Admins can delete messages" ON public.contact_messages
  FOR DELETE USING (public.check_permission('messages.delete'));

-- Allow anyone to insert messages (contact form)
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);


-- Newsletter Subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (public.check_permission('users.view')); -- Using users.view as proxy or create specific permission

DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers
  FOR DELETE USING (public.check_permission('users.delete'));

-- Allow anyone to subscribe
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);


-- Admin Users (Self-management and Super Admin)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (public.check_permission('users.view'));

DROP POLICY IF EXISTS "Super Admins can manage admin users" ON public.admin_users;
CREATE POLICY "Super Admins can manage admin users" ON public.admin_users
  FOR ALL USING (public.check_permission('users.manage_roles'));

-- Allow users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON public.admin_users;
CREATE POLICY "Users can read own data" ON public.admin_users
  FOR SELECT USING (auth.uid() = id);

