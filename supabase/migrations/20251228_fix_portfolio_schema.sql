-- Add Case Study columns to project_translations
ALTER TABLE public.project_translations
ADD COLUMN IF NOT EXISTS challenge text,
ADD COLUMN IF NOT EXISTS solution text,
ADD COLUMN IF NOT EXISTS result text;

-- Remove restrictive CHECK constraint on category column in projects table
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_category_check;

-- Create project_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name_pl text NOT NULL,
  name_en text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for project_categories
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for project_categories
-- Public read access
CREATE POLICY "Public can view project categories" ON public.project_categories
  FOR SELECT
  USING (true);

-- Admin full access
CREATE POLICY "Admins can manage project categories" ON public.project_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.username = auth.jwt() ->> 'email' AND admins.is_active = true
    )
  );

-- Grant permissions
GRANT SELECT ON public.project_categories TO anon, authenticated;
GRANT ALL ON public.project_categories TO authenticated;
