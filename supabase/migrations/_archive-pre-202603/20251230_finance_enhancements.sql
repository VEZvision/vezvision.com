-- Add payment_deadline to transactions for tracking payables
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_deadline DATE;

-- Ensure status check includes pending
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check CHECK (status IN ('pending', 'completed', 'cancelled'));
