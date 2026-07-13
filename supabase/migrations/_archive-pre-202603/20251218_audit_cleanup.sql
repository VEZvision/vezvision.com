-- Database Audit Cleanup Migration

-- 1. Consolidate Trigger Functions
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Add missing updated_at columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'project_phases' AND COLUMN_NAME = 'updated_at') THEN
        ALTER TABLE project_phases ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'time_entries' AND COLUMN_NAME = 'updated_at') THEN
        ALTER TABLE time_entries ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'briefs' AND COLUMN_NAME = 'updated_at') THEN
        ALTER TABLE briefs ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'customer_events' AND COLUMN_NAME = 'updated_at') THEN
        ALTER TABLE customer_events ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'email_templates' AND COLUMN_NAME = 'updated_at') THEN
        ALTER TABLE email_templates ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'offer_versions' AND COLUMN_NAME = 'updated_at') THEN
        ALTER TABLE offer_versions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. Apply standard triggers (Cleanup redundant trigger names if any)
-- Function handle_updated_at is now the standard.

DROP TRIGGER IF EXISTS handle_project_phases_updated_at ON project_phases;
CREATE TRIGGER handle_project_phases_updated_at BEFORE UPDATE ON project_phases FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_time_entries_updated_at ON time_entries;
CREATE TRIGGER handle_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_briefs_updated_at ON briefs;
CREATE TRIGGER handle_briefs_updated_at BEFORE UPDATE ON briefs FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_customer_events_updated_at ON customer_events;
CREATE TRIGGER handle_customer_events_updated_at BEFORE UPDATE ON customer_events FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_email_templates_updated_at ON email_templates;
CREATE TRIGGER handle_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_offer_versions_updated_at ON offer_versions;
CREATE TRIGGER handle_offer_versions_updated_at BEFORE UPDATE ON offer_versions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Fix invoices trigger (it used update_updated_at_column which might not exist or be different)
DROP TRIGGER IF EXISTS handle_invoices_updated_at ON invoices;
CREATE TRIGGER handle_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 4. Standardize Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('contracts', 'contracts', false),
('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;

-- 5. Storage Policies for Contracts (Private)
CREATE POLICY "Admin manage contracts" ON storage.objects FOR ALL
USING (bucket_id = 'contracts')
WITH CHECK (bucket_id = 'contracts');

-- 6. Storage Policies for Media (Publicly readable, Admin manageable)
CREATE POLICY "Public access to media" ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Admin manage media" ON storage.objects FOR ALL
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');
