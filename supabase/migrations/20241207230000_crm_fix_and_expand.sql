-- Rename 'company' to 'company_name' in leads table for consistency with clients table
ALTER TABLE leads RENAME COLUMN company TO company_name;

-- Add new columns for "Existing Features Expansion" (address, nip, etc if missing)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website TEXT;

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_terms TEXT; -- e.g. "Netto 14 days"
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'b2b'; -- 'b2b', 'uop', 'other'
