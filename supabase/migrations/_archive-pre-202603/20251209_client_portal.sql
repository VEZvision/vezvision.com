-- Client Portal & PM 2.0 Schema

-- 1. Ensure projects has client_id
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- 2. Project Files
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES auth.users(id), -- Admin or Client
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT, -- in bytes
  type TEXT, -- mime type
  version INTEGER DEFAULT 1,
  is_shared_with_client BOOLEAN DEFAULT false,
  folder TEXT DEFAULT 'root' -- e.g., 'design', 'contracts', 'briefs'
);

-- 3. Project Briefs (Approved/Rejected by Client)
CREATE TABLE IF NOT EXISTS project_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT, -- Markdown or JSON content
  status TEXT DEFAULT 'draft', -- draft, pending_client, approved, rejected
  version INTEGER DEFAULT 1,
  feedback TEXT -- Client feedback if rejected
);

-- 4. Time Logs (Internal)
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  date DATE DEFAULT CURRENT_DATE,
  hours NUMERIC(5, 2) NOT NULL, -- e.g. 1.5, 2.0
  description TEXT,
  billable BOOLEAN DEFAULT true
);

-- 5. Client Access (Linking auth.users to clients table)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified)

-- Files
CREATE POLICY "Admins All Files" ON project_files FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()) OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Clients View Shared Files" ON project_files FOR SELECT USING (
  is_shared_with_client = true AND
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  )
);

-- Briefs
CREATE POLICY "Admins All Briefs" ON project_briefs FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()) OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Clients View Briefs" ON project_briefs FOR SELECT USING (
  status IN ('pending_client', 'approved', 'rejected') AND
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Clients Update Briefs" ON project_briefs FOR UPDATE USING (
  status = 'pending_client' AND
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  )
);

-- Time Logs
CREATE POLICY "Admins All Time Logs" ON time_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()) OR 
  auth.role() = 'service_role'
);
