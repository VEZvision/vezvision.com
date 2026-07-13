-- Add card_variant column to services table
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS card_variant text DEFAULT 'tech-inspire' CHECK (card_variant IN ('tech-inspire', 'synergy', 'schema-break', 'idea-effect'));

-- Add storage bucket for services if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('services', 'services', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for services bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'services' );

CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'services' AND (auth.role() = 'authenticated') );

CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'services' AND (auth.role() = 'authenticated') );

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'services' AND (auth.role() = 'authenticated') );
