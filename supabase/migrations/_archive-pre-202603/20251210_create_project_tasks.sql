-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  project_id UUID REFERENCES internal_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_hours NUMERIC(10,2),
  priority TEXT DEFAULT 'medium', -- low, medium, high
  status TEXT DEFAULT 'todo'      -- todo, in_progress, review, done
);

-- Enable RLS
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Create generic policies (allow all for authenticated users)
CREATE POLICY "Enable all for authenticated users" ON project_tasks FOR ALL USING (auth.role() = 'authenticated');

-- Handle updated_at
CREATE TRIGGER handle_project_tasks_updated_at BEFORE UPDATE ON project_tasks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
