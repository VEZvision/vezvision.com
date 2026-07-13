-- Add Proposal Engine columns to crm_offers table
ALTER TABLE crm_offers 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS roi_calculator_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ab_test_id UUID,
ADD COLUMN IF NOT EXISTS variant_label TEXT, -- 'A', 'B', etc.
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Create index for A/B test grouping
CREATE INDEX IF NOT EXISTS idx_crm_offers_ab_test_id ON crm_offers(ab_test_id);
