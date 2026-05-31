-- Create Roles if they don't exist
INSERT INTO public.admin_roles (name, description) VALUES
('Administrator', 'Full access to most features'),
('Editor', 'Can edit content'),
('Viewer', 'Read-only access')
ON CONFLICT (name) DO NOTHING;

-- Add FAQ permissions
INSERT INTO public.admin_permissions (code, description, module) VALUES
('faq.view', 'Can view FAQ items and categories', 'faq'),
('faq.create', 'Can create FAQ items and categories', 'faq'),
('faq.edit', 'Can edit FAQ items and categories', 'faq'),
('faq.delete', 'Can delete FAQ items and categories', 'faq')
ON CONFLICT (code) DO NOTHING;

-- Assign permissions to Roles
DO $$
DECLARE
  super_admin_role_id uuid;
  admin_role_id uuid;
  editor_role_id uuid;
  viewer_role_id uuid;
  perm_id uuid;
BEGIN
  SELECT id INTO super_admin_role_id FROM public.admin_roles WHERE name = 'Super Admin';
  SELECT id INTO admin_role_id FROM public.admin_roles WHERE name = 'Administrator';
  SELECT id INTO editor_role_id FROM public.admin_roles WHERE name = 'Editor';
  SELECT id INTO viewer_role_id FROM public.admin_roles WHERE name = 'Viewer';

  -- Super Admin gets all FAQ permissions
  FOR perm_id IN SELECT id FROM public.admin_permissions WHERE module = 'faq' LOOP
    IF super_admin_role_id IS NOT NULL THEN
        INSERT INTO public.admin_role_permissions (role_id, permission_id)
        VALUES (super_admin_role_id, perm_id)
        ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Administrator gets all FAQ permissions
  FOR perm_id IN SELECT id FROM public.admin_permissions WHERE module = 'faq' LOOP
    IF admin_role_id IS NOT NULL THEN
        INSERT INTO public.admin_role_permissions (role_id, permission_id)
        VALUES (admin_role_id, perm_id)
        ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Editor gets all FAQ permissions
  FOR perm_id IN SELECT id FROM public.admin_permissions WHERE module = 'faq' LOOP
    IF editor_role_id IS NOT NULL THEN
        INSERT INTO public.admin_role_permissions (role_id, permission_id)
        VALUES (editor_role_id, perm_id)
        ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  
  -- Viewer gets only view permission
  SELECT id INTO perm_id FROM public.admin_permissions WHERE code = 'faq.view';
  IF viewer_role_id IS NOT NULL AND perm_id IS NOT NULL THEN
      INSERT INTO public.admin_role_permissions (role_id, permission_id)
      VALUES (viewer_role_id, perm_id)
      ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- Enable RLS for FAQ tables
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_item_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for FAQ Categories
DROP POLICY IF EXISTS "Public can view faq categories" ON public.faq_categories;
CREATE POLICY "Public can view faq categories" ON public.faq_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert faq categories" ON public.faq_categories;
CREATE POLICY "Admins can insert faq categories" ON public.faq_categories FOR INSERT WITH CHECK (public.check_permission('faq.create'));

DROP POLICY IF EXISTS "Admins can update faq categories" ON public.faq_categories;
CREATE POLICY "Admins can update faq categories" ON public.faq_categories FOR UPDATE USING (public.check_permission('faq.edit'));

DROP POLICY IF EXISTS "Admins can delete faq categories" ON public.faq_categories;
CREATE POLICY "Admins can delete faq categories" ON public.faq_categories FOR DELETE USING (public.check_permission('faq.delete'));

-- RLS Policies for FAQ Items
DROP POLICY IF EXISTS "Public can view faq items" ON public.faq_items;
CREATE POLICY "Public can view faq items" ON public.faq_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert faq items" ON public.faq_items;
CREATE POLICY "Admins can insert faq items" ON public.faq_items FOR INSERT WITH CHECK (public.check_permission('faq.create'));

DROP POLICY IF EXISTS "Admins can update faq items" ON public.faq_items;
CREATE POLICY "Admins can update faq items" ON public.faq_items FOR UPDATE USING (public.check_permission('faq.edit'));

DROP POLICY IF EXISTS "Admins can delete faq items" ON public.faq_items;
CREATE POLICY "Admins can delete faq items" ON public.faq_items FOR DELETE USING (public.check_permission('faq.delete'));

-- RLS Policies for FAQ Category Translations
DROP POLICY IF EXISTS "Public can view faq category translations" ON public.faq_category_translations;
CREATE POLICY "Public can view faq category translations" ON public.faq_category_translations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert faq category translations" ON public.faq_category_translations;
CREATE POLICY "Admins can insert faq category translations" ON public.faq_category_translations FOR INSERT WITH CHECK (public.check_permission('faq.create'));

DROP POLICY IF EXISTS "Admins can update faq category translations" ON public.faq_category_translations;
CREATE POLICY "Admins can update faq category translations" ON public.faq_category_translations FOR UPDATE USING (public.check_permission('faq.edit'));

DROP POLICY IF EXISTS "Admins can delete faq category translations" ON public.faq_category_translations;
CREATE POLICY "Admins can delete faq category translations" ON public.faq_category_translations FOR DELETE USING (public.check_permission('faq.delete'));

-- RLS Policies for FAQ Item Translations
DROP POLICY IF EXISTS "Public can view faq item translations" ON public.faq_item_translations;
CREATE POLICY "Public can view faq item translations" ON public.faq_item_translations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert faq item translations" ON public.faq_item_translations;
CREATE POLICY "Admins can insert faq item translations" ON public.faq_item_translations FOR INSERT WITH CHECK (public.check_permission('faq.create'));

DROP POLICY IF EXISTS "Admins can update faq item translations" ON public.faq_item_translations;
CREATE POLICY "Admins can update faq item translations" ON public.faq_item_translations FOR UPDATE USING (public.check_permission('faq.edit'));

DROP POLICY IF EXISTS "Admins can delete faq item translations" ON public.faq_item_translations;
CREATE POLICY "Admins can delete faq item translations" ON public.faq_item_translations FOR DELETE USING (public.check_permission('faq.delete'));
