-- Migration: Secure Media Library Buckets (2025-12-29)

-- 1. Ensure 'offer-assets' bucket exists and is PRIVATE
INSERT INTO storage.buckets (id, name, public)
VALUES ('offer-assets', 'offer-assets', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Ensure 'contracts' bucket exists and is PRIVATE
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 3. Ensure public buckets are PUBLIC
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('media', 'media', true),
  ('portfolio', 'portfolio', true),
  ('blog', 'blog', true),
  ('services', 'services', true)
ON CONFLICT (id) DO UPDATE SET public = true;


-- 4. RLS Policies for 'offer-assets' (STRICT PRIVATE: Admin Only)
DROP POLICY IF EXISTS "Public Access offer-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage offer-assets" ON storage.objects;

CREATE POLICY "Admin Manage offer-assets" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'offer-assets')
WITH CHECK (bucket_id = 'offer-assets');


-- 5. RLS Policies for 'contracts' (STRICT PRIVATE: Admin Only)
DROP POLICY IF EXISTS "Public Access contracts" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage contracts" ON storage.objects;

CREATE POLICY "Admin Manage contracts" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'contracts')
WITH CHECK (bucket_id = 'contracts');


-- 6. Ensure Public Access for 'media' (READ ONLY for Public, WRITE for Admin)
DROP POLICY IF EXISTS "Public Read media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage media" ON storage.objects;

CREATE POLICY "Public Read media" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Admin Manage media" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');


-- 7. Ensure Public Access for 'services' (READ ONLY for Public, WRITE for Admin)
DROP POLICY IF EXISTS "Public Read services" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage services" ON storage.objects;

CREATE POLICY "Public Read services" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'services');

CREATE POLICY "Admin Manage services" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'services')
WITH CHECK (bucket_id = 'services');
