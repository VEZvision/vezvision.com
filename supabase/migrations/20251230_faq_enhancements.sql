-- Migration: FAQ Enhancements (2025-12-30)
-- 1. Add is_active column to faq_categories
ALTER TABLE public.faq_categories 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Add is_active column to faq_items
ALTER TABLE public.faq_items 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Update Public RLS for Categories (Only Active)
DROP POLICY IF EXISTS "Public can view faq categories" ON public.faq_categories;
CREATE POLICY "Public can view faq categories" 
ON public.faq_categories 
FOR SELECT 
USING (is_active = true);

-- 4. Update Public RLS for Items (Only Active)
DROP POLICY IF EXISTS "Public can view faq items" ON public.faq_items;
CREATE POLICY "Public can view faq items" 
ON public.faq_items 
FOR SELECT 
USING (is_active = true);

-- 5. Admin RLS (View All) - Already covered by existing admin policies or logic? 
-- Let's ensure Admins can see EVERYTHING (active or inactive).
-- The previous migration had:
-- CREATE POLICY "Admins can insert/update/delete..." using check_permission.
-- We usually need a "Admins can view all" policy if the "Public" one is restrictive.

DROP POLICY IF EXISTS "Admins can view all faq categories" ON public.faq_categories;
CREATE POLICY "Admins can view all faq categories" 
ON public.faq_categories 
FOR SELECT 
USING (public.check_permission('faq.view'));

DROP POLICY IF EXISTS "Admins can view all faq items" ON public.faq_items;
CREATE POLICY "Admins can view all faq items" 
ON public.faq_items 
FOR SELECT 
USING (public.check_permission('faq.view'));
