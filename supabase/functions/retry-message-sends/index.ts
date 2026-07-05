import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { timingSafeEqual } from "node:crypto";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  buildContactNotificationHtml,
  getNotificationSubject,
} from "../_shared/email-templates/contact-notification.ts";
import {
  buildAutoReplyHtml,
  getAutoReplySubject,
} from "../_shared/email-templates/contact-auto-reply.ts";

interface SendLogRow {
  id: string;
  message_id: string | null;
  send_type: "notification" | "auto_reply" | "webhook";
  status: string;
  error_message: string | null;
  created_at: string;
}

interface MessageRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  language: string | null;
  status: string;
}

const MAX_RETRY_AGE_HOURS = 24;
const MAX_RETRIES_PER_RUN = 25;
const PUBLIC_ASSETS_BUCKET = "vezvision-assets";

type SupabaseEdgeClient = ReturnType<typeof createClient>;

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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json",
          Allow: "POST, OPTIONS",
        },
        status: 405,
      },
    );
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const expectedToken = `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`;
  const encoder = new TextEncoder();
  const authBytes = encoder.encode(authHeader);
  const expectedBytes = encoder.encode(expectedToken);
  const authOk =
    authBytes.length === expectedBytes.length &&
    timingSafeEqual(authBytes, expectedBytes);
  if (!authOk) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
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
  const siteUrl = getSiteUrl();

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing env" }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 503,
      },
    );
  }

  const supabase: SupabaseEdgeClient = createClient(
    supabaseUrl,
    serviceRoleKey,
  );

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
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json",
        },
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
      .select("id, full_name, email, phone, subject, message, language, status")
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
        `VEZvision <${fromEmail}>`,
        notifyEmail,
        getNotificationSubject(lang, msg.subject),
        buildContactNotificationHtml({
          fullName: msg.full_name,
          email: msg.email,
          phone: msg.phone,
          subject: msg.subject,
          message: msg.message,
          lang,
          storageBaseUrl,
          siteUrl,
        }),
        msg.email,
      );
    } else if (log.send_type === "auto_reply") {
      result = await sendEmailViaResend(
        resendApiKey,
        `VEZvision <${fromEmail}>`,
        msg.email,
        getAutoReplySubject(lang),
        buildAutoReplyHtml({
          fullName: msg.full_name,
          lang,
          storageBaseUrl,
          siteUrl,
        }),
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
    {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    },
  );
});
