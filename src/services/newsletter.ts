import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/logger';

export async function subscribeToNewsletter(
  email: string,
  language: 'pl' | 'en' = 'pl',
  source: string = 'newsletter'
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
            body: { email, language, source }
        });

        if (error) throw error;

        const result = data as { success?: boolean; error?: string } | null;
        if (result?.success === false) {
            return { success: false, error: result.error || 'Wystąpił błąd.' };
        }

        return { success: true };
    } catch (error: unknown) {
        logError('newsletter.subscribe', error);
        const msg = error instanceof Error ? error.message : 'Wystąpił błąd. Spróbuj ponownie później.';
        return { success: false, error: msg };
    }
}

/**
 * Unsubscribe by token (direct link)
 */
export async function unsubscribeByToken(token: string): Promise<{ success: boolean; error?: string; email?: string }> {
    try {
        const { data, error } = await supabase.functions.invoke('unsubscribe-newsletter', {
            body: { token },
        });

        if (error) throw error;

        if (!data.success) {
            return { success: false, error: data.error };
        }

        return { success: true, email: data.email };
    } catch (error: unknown) {
        logError('newsletter.unsubscribe', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

