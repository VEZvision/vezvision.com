-- Create contact_replies table to track admin responses
CREATE TABLE IF NOT EXISTS public.contact_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_replies ENABLE ROW LEVEL SECURITY;

-- Policies for contact_replies
CREATE POLICY "Admins can view replies" ON public.contact_replies
    FOR SELECT TO authenticated
    USING ((select auth.uid()) IN (SELECT id FROM admin_users));

CREATE POLICY "Admins can insert replies" ON public.contact_replies
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) IN (SELECT id FROM admin_users));

-- Add trigger to update parent message status on reply
CREATE OR REPLACE FUNCTION public.update_message_status_on_reply()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.contact_messages
    SET status = 'replied'
    WHERE id = NEW.message_id
    AND status != 'replied';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reply_sent
    AFTER INSERT ON public.contact_replies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_message_status_on_reply();
