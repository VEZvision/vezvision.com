-- Migration: Secure Invoices & Cleanup (2025-12-30)

-- 1. Drop obsolete expenses table (replaced by transactions)
DROP TABLE IF EXISTS public.expenses;

-- 2. Secure INVOICES table (Upgrade from generic 'authenticated' to 'finance.view')
-- Drop existing weak policies
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.invoices;
DROP POLICY IF EXISTS "Allow write access for authenticated users" ON public.invoices;
DROP POLICY IF EXISTS "Allow update access for authenticated users" ON public.invoices;
DROP POLICY IF EXISTS "Allow delete access for authenticated users" ON public.invoices;

-- Add strict RBAC policy
CREATE POLICY "Admins can manage invoices" ON public.invoices
    FOR ALL
    USING (public.check_permission('finance.view'));

-- 3. Ensure transactions has correct policy (already done in previous migration, but good to be safe/consistent if re-running)
-- (Skipping as 20251230_hr_finance_schema.sql handles it perfectly)
