import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  jsonResponse,
  errorResponse,
  successResponse,
} from "../_shared/response.ts";
import { getClientIp } from "../_shared/clientIp.ts";
import { buildEdgeRateLimitKey } from "../_shared/rateLimitKey.ts";
import { verifyTurnstileToken } from "../_shared/turnstile.ts";
import {
  isContactPhoneProvided,
  normalizeContactEmail,
  normalizeContactPhone,
  normalizeText as normalizeContactText,
} from "../_shared/contactValidation.ts";
import {
  buildContactNotificationHtml,
  getNotificationSubject,
} from "../_shared/email-templates/contact-notification.ts";
import {
  buildAutoReplyHtml,
  getAutoReplySubject,
} from "../_shared/email-templates/contact-auto-reply.ts";
import { buildWebhookHeaders } from "../_shared/webhookSign.ts";

function normalizeLanguage(value: unknown): "pl" | "en" {
  return value === "en" ? "en" : "pl";
}

const PUBLIC_ASSETS_BUCKET = "vezvision-assets";

function getStorageBaseUrl(): string {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!supabaseUrl) return "";
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${PUBLIC_ASSETS_BUCKET}`;
}

function getSiteUrl(): string {
  return (Deno.env.get("SITE_URL") ?? "https://vezvision.com").replace(
    /\/$/,
    "",
  );
}

type SupabaseEdgeClient = ReturnType<typeof createClient>;
type SendType = "notification" | "auto_reply" | "webhook";

async function createSendLog(
  supabase: SupabaseEdgeClient,
  messageId: string,
  sendType: SendType,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("vv_message_send_logs")
    .insert({ message_id: messageId, send_type: sendType, status: "pending" })
    .select("id")
    .single();
  if (error) console.error("sendLog.create", error);
  return data?.id ?? null;
}

async function updateSendLog(
  supabase: SupabaseEdgeClient,
  logId: string | null,
  status: "sent" | "failed",
  errorMessage?: string,
): Promise<void> {
  if (!logId) return;
  const { error } = await supabase
    .from("vv_message_send_logs")
    .update({ status, error_message: errorMessage ?? null })
    .eq("id", logId);
  if (error) console.error("sendLog.update", error);
}

async function sendEmailViaResend(
  resendApiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Resend API error");
      return { ok: false, error: resData.message || "Resend API error" };
    }

    return { ok: true };
  } catch (err) {
    console.error("Resend fetch error");
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return errorResponse(cors, "Method not allowed", 405);
  }

  const clientIp = getClientIp(req);
  let bodyLanguage: "pl" | "en" = "pl";

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      return errorResponse(cors, "Service unavailable", 503);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const rateLimitKey = await buildEdgeRateLimitKey(
      "edge-contact",
      req,
      clientIp,
    );
    const { data: edgeRateLimitRows, error: edgeRateError } =
      await supabase.rpc("consume_rate_limit", {
        p_key: rateLimitKey,
        p_max_requests: 10,
        p_window_ms: 60000,
      });
    const edgeRateLimit = Array.isArray(edgeRateLimitRows)
      ? edgeRateLimitRows[0]
      : edgeRateLimitRows;
    if (edgeRateError || !edgeRateLimit?.allowed) {
      return errorResponse(cors, "Rate limit exceeded", 429);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return errorResponse(cors, "Invalid JSON payload", 400, "form");
    }

    bodyLanguage = normalizeLanguage(body?.language);
    const turnstile = await verifyTurnstileToken(
      body?.turnstile_token,
      clientIp,
    );
    if (!turnstile.ok) {
      return errorResponse(cors, "Captcha verification failed.", 400, "form");
    }

    const fullName = normalizeContactText(body?.full_name, 120, 2);
    const email = normalizeContactEmail(body?.email);
    const subject = normalizeContactText(body?.subject, 160, 2);
    const message = normalizeContactText(body?.message, 5000, 10);
    const phoneResult = normalizeContactPhone(body?.phone);

    if (!fullName || !email || !subject || !message) {
      return errorResponse(cors, "Invalid contact form payload", 400, "form");
    }

    if (
      phoneResult.invalid ||
      (isContactPhoneProvided(body?.phone) && !phoneResult.phone)
    ) {
      return errorResponse(
        cors,
        bodyLanguage === "pl"
          ? "Podaj poprawny numer telefonu."
          : "Enter a valid phone number.",
        400,
        "phone",
      );
    }

    const { data: id, error } = await supabase.rpc(
      "safe_insert_contact_message",
      {
        p_full_name: fullName,
        p_email: email,
        p_subject: subject,
        p_message: message,
        p_phone: phoneResult.phone,
        p_status: "new",
        p_language: bodyLanguage,
        p_client_ip: clientIp,
      },
    );

    if (error) {
      const msg = error.message || "Unknown error";
      const isRateLimit = msg.toLowerCase().includes("rate limit");
      return errorResponse(
        cors,
        isRateLimit
          ? bodyLanguage === "pl"
            ? "Zbyt wiele prób. Spróbuj ponownie za kilka minut."
            : "Too many attempts. Try again in a few minutes."
          : bodyLanguage === "pl"
            ? "Nie udało się wysłać wiadomości. Sprawdź dane i spróbuj ponownie."
            : "Could not send your message. Please check your details and try again.",
        isRateLimit ? 429 : 400,
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    const notifyEmail =
      Deno.env.get("CONTACT_NOTIFY_EMAIL") || "contact@vezvision.com";
    const storageBaseUrl = getStorageBaseUrl();
    const siteUrl = getSiteUrl();

    if (resendApiKey && fromEmail) {
      void (async () => {
        const logId = await createSendLog(supabase, String(id), "notification");
        const result = await sendEmailViaResend(
          resendApiKey,
          `VezVision <${fromEmail}>`,
          notifyEmail,
          getNotificationSubject(bodyLanguage, subject),
          buildContactNotificationHtml({
            fullName,
            email,
            phone: phoneResult.phone,
            subject,
            message,
            lang: bodyLanguage,
            storageBaseUrl,
            siteUrl,
          }),
          email,
        );
        await updateSendLog(
          supabase,
          logId,
          result.ok ? "sent" : "failed",
          result.error,
        );
        if (!result.ok) console.error("Notification email error", result.error);
      })();

      void (async () => {
        const logId = await createSendLog(supabase, String(id), "auto_reply");
        const result = await sendEmailViaResend(
          resendApiKey,
          `VezVision <${fromEmail}>`,
          email,
          getAutoReplySubject(bodyLanguage),
          buildAutoReplyHtml({
            fullName,
            lang: bodyLanguage,
            storageBaseUrl,
            siteUrl,
          }),
        );
        await updateSendLog(
          supabase,
          logId,
          result.ok ? "sent" : "failed",
          result.error,
        );
        if (!result.ok) console.error("Auto-reply email error", result.error);
      })();
    } else {
      console.warn(
        "RESEND_API_KEY or RESEND_FROM_EMAIL not set — emails skipped",
      );
    }

    const webhookUrl = Deno.env.get("VEZCRM_WEBHOOK_URL");
    const webhookSecret = Deno.env.get("VEZCRM_WEBHOOK_SECRET");
    if (webhookUrl && webhookSecret) {
      const webhookBody = JSON.stringify({
        name: fullName,
        email,
        phone: phoneResult.phone,
        message,
        source: "contact-form",
      });

      void (async () => {
        const logId = await createSendLog(supabase, String(id), "webhook");
        try {
          const res = await fetch(webhookUrl, {
            method: "POST",
            headers: buildWebhookHeaders(webhookBody, webhookSecret),
            body: webhookBody,
          });
          if (!res.ok) {
            await updateSendLog(
              supabase,
              logId,
              "failed",
              `HTTP ${res.status}`,
            );
            console.error("Webhook error", `HTTP ${res.status}`);
            return;
          }
          await updateSendLog(supabase, logId, "sent");
        } catch (err) {
          await updateSendLog(
            supabase,
            logId,
            "failed",
            err instanceof Error ? err.message : "Unknown error",
          );
          console.error("Webhook error", err);
        }
      })();
    }

    return successResponse(cors, { id });
  } catch (err) {
    console.error("submit-contact error", err);
    return errorResponse(
      cors,
      bodyLanguage === "pl"
        ? "Nie udało się wysłać wiadomości. Spróbuj ponownie później."
        : "Could not send your message. Please try again later.",
      500,
    );
  }
});
