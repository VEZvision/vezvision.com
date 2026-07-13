-- Add new columns to the employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS salary_type text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS contract_url text,
ADD COLUMN IF NOT EXISTS employment_end_date date;

-- Add check constraint for salary_type
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employees_salary_type_check') THEN 
        ALTER TABLE employees
        ADD CONSTRAINT employees_salary_type_check CHECK (salary_type IN ('monthly', 'hourly', 'project', 'task'));
    END IF; 
END $$;
