-- Internal Projects
CREATE TABLE IF NOT EXISTS internal_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned', -- planned, active, paused, completed, cancelled
  budget_total NUMERIC(12,2),
  deadline DATE,
  description TEXT
);

-- Project Phases (Gantt)
CREATE TABLE IF NOT EXISTS project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES internal_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending',
  order_index INTEGER DEFAULT 0
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  role TEXT, -- developer, designer, pm
  hourly_rate NUMERIC(10,2),
  avatar_url TEXT,
  email TEXT
);

-- Time Entries
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project_id UUID REFERENCES internal_projects(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id),
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  billable BOOLEAN DEFAULT true
);

-- Briefs
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new', -- new, reviewed, accepted
  content_json JSONB,
  template_type TEXT -- 'website', 'branding', 'marketing'
);

-- Enable RLS
ALTER TABLE internal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

-- Create generic policies (allow all for authenticated users)
-- For a real production app we might want stricter policies, but for this admin panel, auth users are admins.
CREATE POLICY "Enable all for authenticated users" ON internal_projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON project_phases FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON time_entries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON briefs FOR ALL USING (auth.role() = 'authenticated');

-- Triggers for updated_at
CREATE TRIGGER handle_internal_projects_updated_at BEFORE UPDATE ON internal_projects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
