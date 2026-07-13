-- Add Lead Intelligence columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS revenue TEXT,
ADD COLUMN IF NOT EXISTS employees_count TEXT,
ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS decision_makers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS warmup_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS competitors_following JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for warmup score for sorting
CREATE INDEX IF NOT EXISTS idx_leads_warmup_score ON leads(warmup_score DESC);
