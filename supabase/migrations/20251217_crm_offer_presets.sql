CREATE TABLE IF NOT EXISTS crm_offer_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crm_offer_presets ENABLE ROW LEVEL SECURITY;

-- Allow full access to authenticated users (admins)
CREATE POLICY "Enable all for authenticated users" ON crm_offer_presets
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Allow read access to anon if needed (though offers are usually admin-only)
CREATE POLICY "Enable read for anon" ON crm_offer_presets
    FOR SELECT
    USING (true);

-- Insert default presets
INSERT INTO crm_offer_presets (label, price, description) VALUES
    ('Strona WWW (Standard)', 4500, 'Projekt i wdrożenie strony wizytówki (One Page)'),
    ('Sklep Internetowy', 8500, 'Wdrożenie sklepu na platformie WooCommerce/Shopify'),
    ('Aplikacja Webowa (MVP)', 15000, 'Budowa prototypu aplikacji w technologii React/Node.js'),
    ('Audyt SEO/UX', 2000, 'Analiza użyteczności i widoczności strony w sieci'),
    ('Konsultacje (1h)', 350, 'Godzina konsultacji technicznych');
