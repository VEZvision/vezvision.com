-- Tworzenie bucketów dla storage jeśli nie istnieją
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
('portfolio', 'portfolio', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
('blog', 'blog', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
('services', 'services', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Polityki dla bucketów portfolio
CREATE POLICY "Public access to portfolio bucket" ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Admin can manage portfolio bucket" ON storage.objects FOR ALL
USING (bucket_id = 'portfolio');

-- Polityki dla bucketów blog
CREATE POLICY "Public access to blog bucket" ON storage.objects FOR SELECT
USING (bucket_id = 'blog');

CREATE POLICY "Admin can manage blog bucket" ON storage.objects FOR ALL
USING (bucket_id = 'blog');

-- Polityki dla bucketów services
CREATE POLICY "Public access to services bucket" ON storage.objects FOR SELECT
USING (bucket_id = 'services');

CREATE POLICY "Admin can manage services bucket" ON storage.objects FOR ALL
USING (bucket_id = 'services');