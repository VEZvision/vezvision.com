-- Tworzenie tabeli usług
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    image_url TEXT,
    icon VARCHAR(100),
    price DECIMAL(10,2),
    price_unit VARCHAR(20) DEFAULT 'PLN',
    duration VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tworzenie tabeli tłumaczeń dla usług
CREATE TABLE IF NOT EXISTS public.service_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    language VARCHAR(2) NOT NULL CHECK (language IN ('pl', 'en')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    features TEXT[], -- Array tekstowych feature'ów
    meta_title VARCHAR(255),
    meta_description TEXT,
    UNIQUE(service_id, language)
);

-- Tworzenie tabeli kategorii usług
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tworzenie tabeli tłumaczeń dla kategorii
CREATE TABLE IF NOT EXISTS public.service_category_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    language VARCHAR(2) NOT NULL CHECK (language IN ('pl', 'en')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    UNIQUE(category_id, language)
);

-- Tabela łącząca usługi z kategoriami (many-to-many)
CREATE TABLE IF NOT EXISTS public.service_category_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    UNIQUE(service_id, category_id)
);

-- Tworzenie funkcji do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Dodanie triggerów dla updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON public.service_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funkcja pomocnicza do sprawdzania admina
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE (admins.email = auth.email() OR admins.username = auth.email()) 
        AND admins.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS dla tabeli usług
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Polityki dla usług
CREATE POLICY "Public can view active services" ON public.services FOR SELECT
    USING (status = 'active');

CREATE POLICY "Admin can manage services" ON public.services FOR ALL
    USING (is_admin_user());

-- RLS dla tłumaczeń usług
ALTER TABLE public.service_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view service translations" ON public.service_translations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.services 
        WHERE services.id = service_translations.service_id 
        AND services.status = 'active'
    ));

CREATE POLICY "Admin can manage service translations" ON public.service_translations FOR ALL
    USING (is_admin_user());

-- RLS dla kategorii
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories" ON public.service_categories FOR SELECT
    USING (true);

CREATE POLICY "Admin can manage categories" ON public.service_categories FOR ALL
    USING (is_admin_user());

-- RLS dla tłumaczeń kategorii
ALTER TABLE public.service_category_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view category translations" ON public.service_category_translations FOR SELECT
    USING (true);

CREATE POLICY "Admin can manage category translations" ON public.service_category_translations FOR ALL
    USING (is_admin_user());

-- RLS dla przypisań kategorii
ALTER TABLE public.service_category_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view category assignments" ON public.service_category_assignments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.services 
        WHERE services.id = service_category_assignments.service_id 
        AND services.status = 'active'
    ));

CREATE POLICY "Admin can manage category assignments" ON public.service_category_assignments FOR ALL
    USING (is_admin_user());

-- Uprawnienia dla anonimowych użytkowników
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.service_translations TO anon;
GRANT SELECT ON public.service_categories TO anon;
GRANT SELECT ON public.service_category_translations TO anon;
GRANT SELECT ON public.service_category_assignments TO anon;

-- Uprawnienia dla zalogowanych użytkowników
GRANT SELECT ON public.services TO authenticated;
GRANT SELECT ON public.service_translations TO authenticated;
GRANT SELECT ON public.service_categories TO authenticated;
GRANT SELECT ON public.service_category_translations TO authenticated;
GRANT SELECT ON public.service_category_assignments TO authenticated;

-- Uprawnienia dla admina
GRANT ALL ON public.services TO authenticated;
GRANT ALL ON public.service_translations TO authenticated;
GRANT ALL ON public.service_categories TO authenticated;
GRANT ALL ON public.service_category_translations TO authenticated;
GRANT ALL ON public.service_category_assignments TO authenticated;