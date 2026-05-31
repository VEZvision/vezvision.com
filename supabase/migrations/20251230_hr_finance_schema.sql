-- Migration: HR & Finance Schema (2025-12-30)

-- 1. Create EMPLOYEES table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id), -- Optional link to auth user
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    position TEXT,
    department TEXT,
    salary NUMERIC(10, 2),
    currency TEXT DEFAULT 'PLN',
    employment_type TEXT DEFAULT 'B2B', -- B2B, UoP, Uzl
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    hired_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create LEAVE_REQUESTS table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('vacation', 'sick', 'on_demand', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL DEFAULT 1,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create TRANSACTIONS table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT DEFAULT 'general',
    date DATE DEFAULT CURRENT_DATE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL, -- Link to invoice if applicable
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: EMPLOYEES
DROP POLICY IF EXISTS "Admins can manage employees" ON public.employees;
CREATE POLICY "Admins can manage employees" ON public.employees
    FOR ALL
    USING (public.check_permission('hr.view')); -- Using general permission check or create specific hr permissions

-- RLS Policies: LEAVE_REQUESTS
DROP POLICY IF EXISTS "Admins can manage leave requests" ON public.leave_requests;
CREATE POLICY "Admins can manage leave requests" ON public.leave_requests
    FOR ALL
    USING (public.check_permission('hr.view'));

-- RLS Policies: TRANSACTIONS
DROP POLICY IF EXISTS "Admins can manage transactions" ON public.transactions;
CREATE POLICY "Admins can manage transactions" ON public.transactions
    FOR ALL
    USING (public.check_permission('finance.view'));

-- Create Triggers for updated_at
DROP TRIGGER IF EXISTS on_auth_user_created ON public.employees;
-- Reuse existing handle_updated_at function
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.leave_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
