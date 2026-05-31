-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  number TEXT NOT NULL, -- e.g. "FV/2025/12/01"
  date_issued DATE NOT NULL DEFAULT CURRENT_DATE,
  date_due DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, paid, overdue, partial
  currency TEXT DEFAULT 'PLN',
  net_amount NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) DEFAULT 0,
  items JSONB DEFAULT '[]'::jsonb, -- Array of { description, quantity, price, vat_rate, total }
  notes TEXT,
  payment_method TEXT DEFAULT 'transfer', -- transfer, card, cash
  seller_details JSONB, -- Snapshot of seller details at time of invoice
  buyer_details JSONB -- Snapshot of buyer details at time of invoice
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  category TEXT NOT NULL, -- office, marketing, software, services, salary, tax, other
  merchant_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'PLN',
  description TEXT,
  receipt_scan_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  ocr_data JSONB -- Data extracted via OCR (mock or real)
);

-- Add RLS policies (Open for verified admins)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for authenticated users" ON invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write access for authenticated users" ON invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access for authenticated users" ON invoices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access for authenticated users" ON invoices FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write access for authenticated users" ON expenses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access for authenticated users" ON expenses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access for authenticated users" ON expenses FOR DELETE USING (auth.role() = 'authenticated');

-- Triggers for updated_at
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
