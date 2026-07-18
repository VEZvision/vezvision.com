import { getApiClient } from "@/lib/api";
import { logError } from "@/lib/logger";

export async function subscribeToNewsletter(
  email: string,
  language: "pl" | "en" = "pl",
  source: string = "newsletter",
  turnstileToken?: string,
  privacyAccepted: boolean = false,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await getApiClient().invoke<{
      success?: boolean;
      error?: string;
    }>("subscribe-newsletter", {
      email,
      language,
      source,
      privacy_accepted: privacyAccepted,
      ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
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
    const response = await getApiClient().invoke<{
      success?: boolean;
      error?: string;
      email?: string;
    }>("unsubscribe-newsletter", { token });

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

export async function confirmNewsletterByToken(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await getApiClient().invoke<{ success?: boolean; error?: string }>(
      "confirm-newsletter",
      { token },
    );
    if (response.error) throw response.error;
    return response.data?.success
      ? { success: true }
      : { success: false, error: response.data?.error || "Unknown error" };
  } catch (error: unknown) {
    logError("newsletter.confirm", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
