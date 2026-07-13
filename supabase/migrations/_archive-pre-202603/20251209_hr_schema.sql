-- Job Offers
CREATE TABLE IF NOT EXISTS job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  type TEXT, -- full-time, b2b, etc.
  salary_range TEXT,
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' -- draft, published, closed
);

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  job_offer_id UUID REFERENCES job_offers(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cv_url TEXT,
  status TEXT DEFAULT 'new', -- new, screening, interview, offer, hired, rejected
  notes TEXT,
  rating INTEGER DEFAULT 0
);

-- Update Team Members (Employees)
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'; -- active, on_leave, terminated

-- Enable RLS
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Create generic policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_offers' AND policyname = 'Enable all for authenticated users') THEN
        CREATE POLICY "Enable all for authenticated users" ON job_offers FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'Enable all for authenticated users') THEN
        CREATE POLICY "Enable all for authenticated users" ON candidates FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;
