-- Add context columns to click_events
ALTER TABLE click_events 
ADD COLUMN IF NOT EXISTS element_text text,
ADD COLUMN IF NOT EXISTS element_class text,
ADD COLUMN IF NOT EXISTS element_id text;

-- Optional: Create an index on element_text for potential future filtering
CREATE INDEX IF NOT EXISTS idx_click_events_element_text ON click_events(element_text);
