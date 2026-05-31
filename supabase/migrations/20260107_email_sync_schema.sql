-- Migration: Add support for Email Synchronization (IMAP)
-- Date: 2026-01-07

-- 1. Add columns to 'contact_replies' for threading and direction
ALTER TABLE public.contact_replies
ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE, -- Stores Message-ID header
ADD COLUMN IF NOT EXISTS direction TEXT CHECK (direction IN ('inbound', 'outbound')) DEFAULT 'outbound',
ADD COLUMN IF NOT EXISTS raw_data JSONB; -- Stores debugging info

-- 2. Add columns to 'contact_messages' for threading initial emails
ALTER TABLE public.contact_messages
ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE, -- Stores Message-ID of the original email
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT now();

-- 3. Index for performance on identifying threads
CREATE INDEX IF NOT EXISTS idx_contact_replies_external_id ON public.contact_replies(external_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_external_id ON public.contact_messages(external_id);

-- 4. Update the trigger to update last_message_at on new reply
CREATE OR REPLACE FUNCTION public.update_message_timestamp_on_reply()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.contact_messages
    SET last_message_at = NEW.sent_at,
        status = CASE 
            WHEN NEW.direction = 'outbound' THEN 'replied'
            WHEN NEW.direction = 'inbound' THEN 'new' -- Re-open ticket if client replies
            ELSE status
        END
    WHERE id = NEW.message_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach or create trigger (drop old one if needed to replace logic)
DROP TRIGGER IF EXISTS on_reply_timestamp_update ON public.contact_replies;
CREATE TRIGGER on_reply_timestamp_update
AFTER INSERT ON public.contact_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_message_timestamp_on_reply();

-- Also ensure the old trigger 'on_reply_sent' doesn't conflict or is removed if this replaces it.
-- The old function 'update_message_status_on_reply' only set status to 'replied'. 
-- We can drop the old trigger to avoid double updates.
DROP TRIGGER IF EXISTS on_reply_sent ON public.contact_replies;
