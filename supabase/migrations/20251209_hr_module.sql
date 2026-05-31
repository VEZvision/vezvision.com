-- HR Module Schema

-- Employees Table (extends auth.users or standalone)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  position TEXT,
  department TEXT, -- Marketing, IT, Sales, HR
  hire_date DATE,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' -- active, onboarding, terminated
);

-- Leaves (Absences)
CREATE TABLE IF NOT EXISTS leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- vacation, sick, remote, unpaid
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reason TEXT
);

-- Onboarding Tasks Templates
CREATE TABLE IF NOT EXISTS onboarding_task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  department TEXT, -- if null, applies to all
  is_required BOOLEAN DEFAULT true
);

-- Employee Onboarding Progress
CREATE TABLE IF NOT EXISTS employee_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  task_template_id UUID REFERENCES onboarding_task_templates(id),
  status TEXT DEFAULT 'pending', -- pending, completed
  completed_at TIMESTAMPTZ
);

-- Evaluations (Reviews)
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id UUID, -- could reference auth.users
  review_date DATE DEFAULT CURRENT_DATE,
  rating INTEGER, -- 1-5 or 1-10
  content TEXT,
  period TEXT -- Q1 2025, etc.
);

-- Insert Permissions in Roles (if roles table exists)
-- This assumes the roles table from previous step exists. 
-- We won't insert blindly to avoid errors, but this is logically where it belongs.

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for admin access)
CREATE POLICY "Admin All Access Employees" ON employees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Leaves" ON leaves FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Onboarding Templates" ON onboarding_task_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Employee Onboarding" ON employee_onboarding FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Evaluations" ON evaluations FOR ALL USING (auth.role() = 'authenticated');

-- Insert Sample Data
INSERT INTO employees (full_name, email, position, department, hire_date, status) VALUES
('Anna Kowalska', 'anna@vezvision.com', 'Senior Designer', 'Design', '2024-01-15', 'active'),
('Piotr Nowak', 'piotr@vezvision.com', 'Frontend Developer', 'IT', '2024-03-01', 'active'),
('Marek Zając', 'marek@vezvision.com', 'Sales Manager', 'Sales', '2024-06-01', 'active');

INSERT INTO onboarding_task_templates (title,  department) VALUES
('Konfiguracja konta email', NULL),
('Podpisanie umowy NDA', NULL),
('Szkolenie BHP', NULL),
('Konfiguracja środowiska dev', 'IT'),
('Zapoznanie z Brand Bookiem', 'Design');
