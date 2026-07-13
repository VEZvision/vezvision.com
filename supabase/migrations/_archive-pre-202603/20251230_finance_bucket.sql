-- Create a private 'finance' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('finance', 'finance', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Admin can do everything in 'finance' bucket
CREATE POLICY "Admin Access to Finance Bucket"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'finance' 
  AND public.check_permission('finance.view') = true
)
WITH CHECK (
  bucket_id = 'finance' 
  AND public.check_permission('finance.view') = true
);

-- Ensure transactions table has a receipt_url column just in case
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Update RLS for transactions to be super safe (already done in previous migration, but double check)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
