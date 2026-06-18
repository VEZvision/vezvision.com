import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface SendLogRow {
  id: string;
  message_id: string | null;
  send_type: "notification" | "auto_reply" | "webhook";
  status: string;
  error_message: string | null;
}

interface MessageRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  language: string | null;
}

const MAX_RETRY_AGE_HOURS = 24;
const MAX_RETRIES_PER_RUN = 25;
const PUBLIC_ASSETS_BUCKET = "vezvision-assets";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getStorageBaseUrl(): string {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!supabaseUrl) return "";
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${PUBLIC_ASSETS_BUCKET}`;
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
  storageBaseUrl: string;
}): string {
  const fullName = escapeHtml(data.fullName);
  const email = escapeHtml(data.email);
  const phone = data.phone ? escapeHtml(data.phone) : null;
  const subject = escapeHtml(data.subject);
  const message = escapeHtml(data.message);
  const logoUrl = data.storageBaseUrl
    ? `${data.storageBaseUrl}/logo-navbar.svg`
    : "";
  const phoneRow = data.phone
    ? `<tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;width:120px;border-bottom:1px solid #e5e7eb;">${data.lang === "pl" ? "Telefon" : "Phone"}</td><td style="padding:10px 16px;color:#374151;border-bottom:1px solid #e5e7eb;">${phone}</td></tr>`
    : "";
  return `<!DOCTYPE html><html lang="${data.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:24px;background:#f3f4f6;font-family:Inter,system-ui,-apple-system,sans-serif;color:#0f0f0f;-webkit-font-smoothing:antialiased;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;"><tr><td style="padding:28px 32px 20px 32px;text-align:center;"><a href="https://vezvision.com" style="display:inline-block;text-decoration:none;">${logoUrl ? `<img src="${logoUrl}" alt="VezVision" height="28" style="display:block;height:28px;width:auto;" />` : '<span style="font-size:20px;font-weight:700;">VezVision</span>'}</a><span style="display:inline-block;margin-top:12px;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:9999px;padding:4px 12px;">${data.lang === "pl" ? "Formularz kontaktowy" : "Contact form"}</span></td></tr><tr><td style="padding:0 32px 20px 32px;"><h1 style="margin:0;font-size:22px;line-height:1.2;color:#0f0f0f;font-weight:700;letter-spacing:-0.02em;">${data.lang === "pl" ? "Nowa wiadomość" : "New message"}</h1></td></tr><tr><td style="padding:0 32px 24px 32px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;"><tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;width:120px;border-bottom:1px solid #e5e7eb;">${data.lang === "pl" ? "Imię i nazwisko" : "Full name"}</td><td style="padding:10px 16px;color:#374151;border-bottom:1px solid #e5e7eb;">${fullName}</td></tr><tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;border-bottom:1px solid #e5e7eb;">Email</td><td style="padding:10px 16px;color:#374151;border-bottom:1px solid #e5e7eb;"><a href="mailto:${email}" style="color:#04070d;text-decoration:underline;">${email}</a></td></tr>${phoneRow}<tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;">${data.lang === "pl" ? "Temat" : "Subject"}</td><td style="padding:10px 16px;color:#374151;">${subject}</td></tr></table></td></tr><tr><td style="padding:0 32px 32px 32px;"><div style="padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;"><p style="margin:0 0 8px 0;font-weight:600;color:#0f0f0f;font-size:13px;">${data.lang === "pl" ? "Wiadomość" : "Message"}:</p><p style="margin:0;color:#374151;white-space:pre-wrap;line-height:1.6;font-size:14px;">${message}</p></div></td></tr></table></body></html>`;
}

function getAutoReplySubject(lang: string): string {
  return lang === "pl"
    ? "Potwierdzenie wiadomości VezVision"
    : "Message received by VezVision";
}

function getAutoReplyHtml(data: {
  fullName: string;
  lang: string;
  storageBaseUrl: string;
}): string {
  const isPl = data.lang === "pl";
  const fullName = escapeHtml(data.fullName);
  const greeting = isPl ? `Dzień dobry, ${fullName}!` : `Hello, ${fullName}!`;
  const body = isPl
    ? "Dziękujemy za wiadomość. Odpiszemy możliwie szybko, zwykle w ciągu 24 godzin."
    : "Thanks for your message. We will reply as soon as we can, usually within 24 hours.";
  const logoUrl = data.storageBaseUrl
    ? `${data.storageBaseUrl}/logo-navbar.svg`
    : "";
  return `<!DOCTYPE html><html lang="${data.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:24px;background:#f3f4f6;font-family:Inter,system-ui,-apple-system,sans-serif;color:#0f0f0f;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;"><tr><td style="padding:28px 32px 20px 32px;text-align:center;"><a href="https://vezvision.com" style="display:inline-block;text-decoration:none;">${logoUrl ? `<img src="${logoUrl}" alt="VezVision" height="28" style="display:block;height:28px;width:auto;" />` : '<span style="font-size:20px;font-weight:700;">VezVision</span>'}</a></td></tr><tr><td style="padding:0 32px 24px 32px;"><p style="margin:0 0 16px;font-size:18px;color:#0f0f0f;font-weight:600;">${greeting}</p><p style="margin:0 0 20px;color:#374151;line-height:1.7;font-size:15px;">${body}</p><p style="margin:0;color:#374151;font-size:15px;">${isPl ? "Pozdrawiamy" : "Kind regards"},<br><strong style="color:#0f0f0f;">VezVision</strong></p></td></tr><tr><td style="padding:20px 32px 28px 32px;text-align:center;"><a href="https://vezvision.com" style="display:inline-block;background:#04070d;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">${isPl ? "Odwiedź naszą stronę" : "Visit our website"}</a></td></tr></table></body></html>`;
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
    if (!res.ok)
      return { ok: false, error: resData.message || "Resend API error" };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        headers: { "Content-Type": "application/json", Allow: "POST" },
        status: 405,
      },
    );
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const expectedToken = `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`;
  if (!authHeader || authHeader !== expectedToken) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 401,
      },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail =
    Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
  const notifyEmail =
    Deno.env.get("CONTACT_NOTIFY_EMAIL") || "contact@vezvision.com";
  const storageBaseUrl = getStorageBaseUrl();

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing env" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 503,
      },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: failedLogs, error: fetchError } = await supabase
    .from("vv_message_send_logs")
    .select("id, message_id, send_type, status, error_message, created_at")
    .eq("status", "failed")
    .gt(
      "created_at",
      new Date(Date.now() - MAX_RETRY_AGE_HOURS * 60 * 60 * 1000).toISOString(),
    )
    .order("created_at", { ascending: true })
    .limit(MAX_RETRIES_PER_RUN);

  if (fetchError) {
    return new Response(
      JSON.stringify({ success: false, error: fetchError.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }

  const logs = (failedLogs ?? []) as unknown as SendLogRow[];
  let retried = 0;
  let succeeded = 0;

  for (const log of logs) {
    if (!log.message_id) continue;
    const { data: msgData } = await supabase
      .from("messages")
      .select("id, full_name, email, phone, subject, message, language")
      .eq("id", log.message_id)
      .maybeSingle();
    const msg = msgData as unknown as MessageRow | null;
    if (!msg) continue;
    if (msg.status === "anonymized") {
      await supabase
        .from("vv_message_send_logs")
        .update({ status: "failed", error_message: "message anonymized" })
        .eq("id", log.id);
      continue;
    }

    const lang = msg.language === "en" ? "en" : "pl";
    let result: { ok: boolean; error?: string };

    if (log.send_type === "notification") {
      result = await sendEmailViaResend(
        resendApiKey,
        `VezVision <${fromEmail}>`,
        notifyEmail,
        getNotificationSubject(lang, msg.subject),
        getNotificationHtml({
          fullName: msg.full_name,
          email: msg.email,
          phone: msg.phone,
          subject: msg.subject,
          message: msg.message,
          lang,
          storageBaseUrl,
        }),
        msg.email,
      );
    } else if (log.send_type === "auto_reply") {
      result = await sendEmailViaResend(
        resendApiKey,
        `VezVision <${fromEmail}>`,
        msg.email,
        getAutoReplySubject(lang),
        getAutoReplyHtml({ fullName: msg.full_name, lang, storageBaseUrl }),
      );
    } else {
      // webhook retry is handled externally; skip here.
      continue;
    }

    retried++;
    await supabase
      .from("vv_message_send_logs")
      .update({
        status: result.ok ? "sent" : "failed",
        error_message: result.ok ? null : (result.error ?? null),
      })
      .eq("id", log.id);
    if (result.ok) succeeded++;
  }

  return new Response(
    JSON.stringify({
      success: true,
      retried,
      succeeded,
      total_failed: logs.length,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
