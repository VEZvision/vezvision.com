import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getClientIp } from "../_shared/clientIp.ts";
import {
  isContactPhoneProvided,
  normalizeContactEmail,
  normalizeContactPhone,
  normalizeText as normalizeContactText,
} from "../_shared/contactValidation.ts";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeLanguage(value: unknown): "pl" | "en" {
  return value === "en" ? "en" : "pl";
}

function getNotificationSubject(lang: string, subject: string): string {
  return lang === "pl"
    ? `Nowa wiadomość z formularza kontaktowego: ${subject}`
    : `New contact form message: ${subject}`;
}

function getNotificationHtml(data: {
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  lang: string;
}): string {
  const fullName = escapeHtml(data.fullName);
  const email = escapeHtml(data.email);
  const phone = data.phone ? escapeHtml(data.phone) : null;
  const subject = escapeHtml(data.subject);
  const message = escapeHtml(data.message);

  const phoneRow = data.phone
    ? `<tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;width:120px;border-bottom:1px solid #e5e7eb;">${data.lang === "pl" ? "Telefon" : "Phone"}</td><td style="padding:10px 16px;color:#374151;border-bottom:1px solid #e5e7eb;">${phone}</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="${data.lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:Inter,system-ui,-apple-system,sans-serif;color:#0f0f0f;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:28px 32px 20px 32px;text-align:center;">
        <a href="https://vezvision.com" style="display:inline-block;text-decoration:none;">
          <img src="https://pcxcqbpygyidkusetghk.supabase.co/storage/v1/object/public/vezvision-assets/logo-navbar.svg" alt="VezVision" height="28" style="display:block;height:28px;width:auto;" />
        </a>
        <span style="display:inline-block;margin-top:12px;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:9999px;padding:4px 12px;">${data.lang === "pl" ? "Formularz kontaktowy" : "Contact form"}</span>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 20px 32px;">
        <h1 style="margin:0;font-size:22px;line-height:1.2;color:#0f0f0f;font-weight:700;letter-spacing:-0.02em;">${data.lang === "pl" ? "Nowa wiadomość" : "New message"}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 24px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;width:120px;border-bottom:1px solid #e5e7eb;">${data.lang === "pl" ? "Imię i nazwisko" : "Full name"}</td><td style="padding:10px 16px;color:#374151;border-bottom:1px solid #e5e7eb;">${fullName}</td></tr>
          <tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;border-bottom:1px solid #e5e7eb;">Email</td><td style="padding:10px 16px;color:#374151;border-bottom:1px solid #e5e7eb;"><a href="mailto:${email}" style="color:#04070d;text-decoration:underline;">${email}</a></td></tr>
          ${phoneRow}
          <tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;">${data.lang === "pl" ? "Temat" : "Subject"}</td><td style="padding:10px 16px;color:#374151;">${subject}</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 32px 32px;">
        <div style="padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
          <p style="margin:0 0 8px 0;font-weight:600;color:#0f0f0f;font-size:13px;">${data.lang === "pl" ? "Wiadomość" : "Message"}:</p>
          <p style="margin:0;color:#374151;white-space:pre-wrap;line-height:1.6;font-size:14px;">${message}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          ${data.lang === "pl" ? "Wiadomość wysłana z formularza kontaktowego na" : "Message sent from the contact form at"} <a href="https://vezvision.com" style="color:#04070d;text-decoration:underline;">vezvision.com</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getAutoReplySubject(lang: string): string {
  return lang === "pl"
    ? "Potwierdzenie wiadomości VezVision"
    : "Message received by VezVision";
}

function getAutoReplyHtml(data: {
  fullName: string;
  lang: string;
}): string {
  const isPl = data.lang === "pl";
  const fullName = escapeHtml(data.fullName);
  const greeting = isPl ? `Dzień dobry, ${fullName}!` : `Hello, ${fullName}!`;
  const body = isPl
    ? "Dziękujemy za wiadomość. Odpiszemy możliwie szybko, zwykle w ciągu 24 godzin."
    : "Thanks for your message. We will reply as soon as we can, usually within 24 hours.";
  const closing = isPl ? "Pozdrawiamy" : "Kind regards";
  const team = "VezVision";

  return `<!DOCTYPE html>
<html lang="${data.lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:Inter,system-ui,-apple-system,sans-serif;color:#0f0f0f;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:28px 32px 20px 32px;text-align:center;">
        <a href="https://vezvision.com" style="display:inline-block;text-decoration:none;">
          <img src="https://pcxcqbpygyidkusetghk.supabase.co/storage/v1/object/public/vezvision-assets/logo-navbar.svg" alt="VezVision" height="28" style="display:block;height:28px;width:auto;" />
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 24px 32px;">
        <p style="margin:0 0 16px;font-size:18px;color:#0f0f0f;font-weight:600;">${greeting}</p>
        <p style="margin:0 0 20px;color:#374151;line-height:1.7;font-size:15px;">${body}</p>
        <p style="margin:0;color:#374151;font-size:15px;">${closing},<br><strong style="color:#0f0f0f;">${team}</strong></p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px 28px 32px;text-align:center;">
        <a href="https://vezvision.com" style="display:inline-block;background:#04070d;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">${isPl ? "Odwiedź naszą stronę" : "Visit our website"}</a>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:0 32px 16px 32px;">
        <a href="https://x.com/vezvision" style="display:inline-block;margin:0 6px;padding:8px;border:1px solid #e5e7eb;border-radius:6px;text-decoration:none;" target="_blank"><img src="https://pcxcqbpygyidkusetghk.supabase.co/storage/v1/object/public/vezvision-assets/icons/x.svg" alt="X" width="16" height="16" style="display:block;" /></a>
        <a href="https://instagram.com/vezvision" style="display:inline-block;margin:0 6px;padding:8px;border:1px solid #e5e7eb;border-radius:6px;text-decoration:none;" target="_blank"><img src="https://pcxcqbpygyidkusetghk.supabase.co/storage/v1/object/public/vezvision-assets/icons/instagram.svg" alt="Instagram" width="16" height="16" style="display:block;" /></a>
        <a href="https://linkedin.com/company/vezvision" style="display:inline-block;margin:0 6px;padding:8px;border:1px solid #e5e7eb;border-radius:6px;text-decoration:none;" target="_blank"><img src="https://pcxcqbpygyidkusetghk.supabase.co/storage/v1/object/public/vezvision-assets/icons/linkedin.svg" alt="LinkedIn" width="16" height="16" style="display:block;" /></a>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:0 32px 16px 32px;">
        <p style="margin:0;font-size:12px;color:#6b7280;">${isPl ? "Strony, aplikacje i automatyzacje dla firm." : "Websites, apps and automation for companies."}</p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:0 32px 24px 32px;border-top:1px solid #e5e7eb;">
        <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;">
          ${isPl ? "Wiadomość wysłana automatycznie. Prosimy nie odpowiadać na ten adres." : "This message was sent automatically. Please do not reply to this address."}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendEmailViaResend(
  resendApiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  replyTo?: string
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
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json", "Allow": "POST, OPTIONS" },
        status: 405,
      }
    );
  }

  try {
    const clientIp = getClientIp(req);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const fullName = normalizeContactText(body?.full_name, 120);
    const email = normalizeContactEmail(body?.email);
    const subject = normalizeContactText(body?.subject, 160);
    const message = normalizeContactText(body?.message, 5000);
    const phoneResult = normalizeContactPhone(body?.phone);
    const language = normalizeLanguage(body?.language);

    if (!fullName || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid contact form payload", field: "form" }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (phoneResult.invalid || (isContactPhoneProvided(body?.phone) && !phoneResult.phone)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: language === "pl" ? "Podaj poprawny numer telefonu." : "Enter a valid phone number.",
          field: "phone",
        }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { data: id, error } = await supabase.rpc("safe_insert_contact_message", {
      p_full_name: fullName,
      p_email: email,
      p_subject: subject,
      p_message: message,
      p_phone: phoneResult.phone,
      p_status: "new",
      p_language: language,
      p_client_ip: clientIp,
    });

    if (error) {
      const msg = error.message || "Unknown error";
      const isRateLimit = msg.toLowerCase().includes("rate limit");
      return new Response(
        JSON.stringify({
          success: false,
          error: isRateLimit
            ? "Zbyt wiele prób. Spróbuj ponownie za godzinę."
            : "Nie udało się wysłać wiadomości. Sprawdź dane i spróbuj ponownie.",
        }),
        {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
          status: isRateLimit ? 429 : 400,
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
    const notifyEmail = Deno.env.get("CONTACT_NOTIFY_EMAIL") || "contact@vezvision.com";

    if (resendApiKey) {
      sendEmailViaResend(
        resendApiKey,
        `VezVision <${fromEmail}>`,
        notifyEmail,
        getNotificationSubject(language, subject),
        getNotificationHtml({
          fullName,
          email,
          phone: phoneResult.phone,
          subject,
          message,
          lang: language,
        }),
        email
      ).catch(() => console.error("Notification email error"));

      sendEmailViaResend(
        resendApiKey,
        `VezVision <${fromEmail}>`,
        email,
        getAutoReplySubject(language),
        getAutoReplyHtml({
          fullName,
          lang: language,
        })
      ).catch(() => console.error("Auto-reply email error"));
    } else {
      console.warn("RESEND_API_KEY not set");
    }

    const webhookUrl = Deno.env.get("VEZCRM_WEBHOOK_URL");
    const webhookSecret = Deno.env.get("VEZCRM_WEBHOOK_SECRET");
    if (webhookUrl && webhookSecret) {
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": webhookSecret,
        },
        body: JSON.stringify({
          name: fullName,
          email,
          phone: phoneResult.phone,
          message,
          source: "contact-form",
        }),
      }).catch(() => console.error("Webhook error"));
    }

    return new Response(
      JSON.stringify({ success: true, id }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 }
    );
  } catch {
    console.error("submit-contact error");
    return new Response(
      JSON.stringify({
        success: false,
        error: "Nie udało się wysłać wiadomości. Spróbuj ponownie później.",
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
