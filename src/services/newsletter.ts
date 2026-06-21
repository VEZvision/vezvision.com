import { getSupabase } from "@/lib/supabase";
import { logError } from "@/lib/logger";

export async function subscribeToNewsletter(
  email: string,
  language: "pl" | "en" = "pl",
  source: string = "newsletter",
  turnstileToken?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabase();
    const response = await supabase.functions.invoke<{
      success?: boolean;
      error?: string;
    }>("subscribe-newsletter", {
      body: {
        email,
        language,
        source,
        ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
      },
    });

    if (response.error) throw response.error;

    const result = response.data;
    if (result?.success === false) {
      return { success: false, error: result.error || "Wystąpił błąd." };
    }

    return { success: true };
  } catch (error: unknown) {
    logError("newsletter.subscribe", error);
    const msg =
      error instanceof Error
        ? error.message
        : "Wystąpił błąd. Spróbuj ponownie później.";
    return { success: false, error: msg };
  }
}

/**
 * Unsubscribe by token (direct link)
 */
export async function unsubscribeByToken(
  token: string,
): Promise<{
  success: boolean;
  error?: string | undefined;
  email?: string | undefined;
}> {
  try {
    const supabase = await getSupabase();
    const response = await supabase.functions.invoke<{
      success?: boolean;
      error?: string;
      email?: string;
    }>("unsubscribe-newsletter", {
      body: { token },
    });

    if (response.error) throw response.error;

    const result = response.data;
    if (!result?.success) {
      return { success: false, error: result?.error || "Unknown error" };
    }

    return { success: true, email: result.email };
  } catch (error: unknown) {
    logError("newsletter.unsubscribe", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
