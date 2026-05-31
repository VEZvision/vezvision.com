-- Create Customer Events / Timeline table
CREATE TABLE IF NOT EXISTS customer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'email', 'call', 'meeting', 'note', 'status_change', 'offer_sent'
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id)
);

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  subject TEXT,
  body_html TEXT NOT NULL,
  category TEXT DEFAULT 'general' -- 'follow_up', 'offer', 'welcome'
);

-- Offer Versions (for detailed versioning)
CREATE TABLE IF NOT EXISTS offer_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  offer_id UUID REFERENCES crm_offers(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content_json JSONB,
  pdf_url TEXT,
  status TEXT DEFAULT 'draft' -- 'draft', 'sent', 'accepted', 'rejected'
);

-- Add public access token to offers for external viewing
ALTER TABLE crm_offers ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid();
ALTER TABLE crm_offers ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;
ALTER TABLE crm_offers ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- RLS
ALTER TABLE customer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated" ON customer_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated" ON email_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated" ON offer_versions FOR ALL USING (auth.role() = 'authenticated');
