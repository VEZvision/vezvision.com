-- Migration: Task Management Revolution
-- Date: 2025-12-18
-- Author: Antigravity

-- 1. Extend project_tasks table
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS actual_hours numeric DEFAULT 0;

-- 2. Create Comments Table
CREATE TABLE IF NOT EXISTS project_task_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id uuid REFERENCES project_tasks(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Use auth.users for security context
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create Checklists Table
CREATE TABLE IF NOT EXISTS project_task_checklists (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id uuid REFERENCES project_tasks(id) ON DELETE CASCADE,
    title text NOT NULL,
    is_completed boolean DEFAULT false,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Create Attachments Table
CREATE TABLE IF NOT EXISTS project_task_attachments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id uuid REFERENCES project_tasks(id) ON DELETE CASCADE,
    file_url text NOT NULL,
    file_type text,
    file_size integer,
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE project_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_task_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_task_attachments ENABLE ROW LEVEL SECURITY;

-- 6. Add Policies (Open for now, can be restricted later based on team membership)
-- Comments
CREATE POLICY "Enable read access for all authenticated users" ON project_task_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for all authenticated users" ON project_task_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for own comments" ON project_task_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for own comments" ON project_task_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Checklists
CREATE POLICY "Enable read access for checkboxes" ON project_task_checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for checkboxes" ON project_task_checklists FOR ALL TO authenticated USING (true);

-- Attachments
CREATE POLICY "Enable read access for attachments" ON project_task_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for attachments" ON project_task_attachments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable delete for own attachments" ON project_task_attachments FOR DELETE TO authenticated USING (auth.uid() = uploaded_by);

-- 7. Add Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE project_task_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE project_task_checklists;
ALTER PUBLICATION supabase_realtime ADD TABLE project_tasks;
