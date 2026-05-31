-- System Configuration
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  "group" TEXT DEFAULT 'general',
  is_secret BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_config' AND policyname = 'Enable all for authenticated users') THEN
        CREATE POLICY "Enable all for authenticated users" ON system_config FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- Insert default placeholder keys (empty)
INSERT INTO system_config (key, value, "group", is_secret) VALUES
('openai_api_key', '', 'ai', true),
('deepl_api_key', '', 'ai', true),
('stability_api_key', '', 'ai', true)
ON CONFLICT (key) DO NOTHING;
