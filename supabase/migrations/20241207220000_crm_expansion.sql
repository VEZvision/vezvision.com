-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Activities Table (History of interactions)
CREATE TABLE IF NOT EXISTS public.crm_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('note', 'call_log', 'email_log', 'status_change', 'meeting', 'offer_sent')),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Reminders Table (Follow-ups)
CREATE TABLE IF NOT EXISTS public.crm_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3. Offers Table (PDF Proposals)
CREATE TABLE IF NOT EXISTS public.crm_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'opened', 'accepted', 'rejected')),
    name TEXT NOT NULL,
    total_value NUMERIC(15, 2),
    currency TEXT DEFAULT 'PLN',
    content_json JSONB DEFAULT '[]'::jsonb, -- Stores line items
    notes TEXT,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_offers ENABLE ROW LEVEL SECURITY;

-- Policies (Admin only for now, similar to leads)
CREATE POLICY "Admins can view all activities" ON public.crm_activities FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can insert activities" ON public.crm_activities FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can update activities" ON public.crm_activities FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can view all reminders" ON public.crm_reminders FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can insert reminders" ON public.crm_reminders FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can update reminders" ON public.crm_reminders FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can delete reminders" ON public.crm_reminders FOR DELETE TO authenticated USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can view all offers" ON public.crm_offers FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Public can view offers by token" ON public.crm_offers FOR SELECT TO anon USING (true); -- Allow public access via token query (logic handled in app/edge function)
CREATE POLICY "Admins can insert offers" ON public.crm_offers FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can update offers" ON public.crm_offers FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_offers;
