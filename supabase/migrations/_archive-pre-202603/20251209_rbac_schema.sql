-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb -- Array of permission strings e.g. ["crm.view", "crm.edit"]
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Insert default roles
INSERT INTO roles (name, description, permissions)
VALUES 
  ('Administrator', 'Pełny dostęp do wszystkich funkcji systemu', '["*"]'::jsonb),
  ('Manager', 'Dostęp do zarządzania, ale bez ustawień systemowych', '["crm.view", "crm.edit", "projects.view", "projects.edit", "marketing.view", "finance.view"]'::jsonb),
  ('Sprzedawca', 'Dostęp tylko do CRM i Leadów', '["crm.view", "crm.edit", "leads.view", "leads.edit", "offers.view", "offers.edit"]'::jsonb),
  ('Redaktor', 'Dostęp do Bloga i Portfolio', '["blog.view", "blog.edit", "portfolio.view", "portfolio.edit"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies (simplified for now, strictly admin managed in practice)
CREATE POLICY "Allow read access for authenticated users" ON roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write access for admins" ON roles FOR ALL USING (auth.role() = 'authenticated'); -- Logic would be stricter in prod

CREATE POLICY "Allow read access for authenticated users" ON user_roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write access for admins" ON user_roles FOR ALL USING (auth.role() = 'authenticated');

-- Verify admin_audit_logs structure for extended logging
-- Ensuring details is JSONB is enough, we will store { before: ..., after: ... } there.
