import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getClientIp } from "../_shared/clientIp.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 5 || email.length > 254 || !EMAIL_PATTERN.test(email)) return null;
  return email;
}

function normalizeSource(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const source = value.trim().slice(0, 50);
  if (!source || /[<>]/.test(source)) return null;
  return source;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json", Allow: "POST, OPTIONS" },
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
    const email = normalizeEmail(body?.email);
    const language = body?.language === 'en' ? 'en' : 'pl';
    const source = normalizeSource(body?.source);

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: language === "pl" ? "Podaj poprawny adres email." : "Enter a valid email address." }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { data: id, error } = await supabase.rpc("safe_insert_newsletter_subscriber", {
      p_email: email,
      p_client_ip: clientIp,
      p_language: language,
      ...(source ? { p_source: source } : {}),
    });

    if (error) {
      const msg = error.message || "Unknown error";
      const isRateLimit = msg.toLowerCase().includes("rate limit");
      const isDuplicate = msg.includes("unique") || error.code === "23505";
      return new Response(
        JSON.stringify({
          success: false,
          error: isRateLimit
            ? language === "pl" ? "Zbyt wiele prób. Spróbuj ponownie za godzinę." : "Too many attempts. Try again in an hour."
            : isDuplicate
              ? language === "pl" ? "Ten adres email jest już zapisany do newslettera." : "This email address is already on the list."
              : language === "pl" ? "Nie udało się zapisać adresu. Spróbuj ponownie później." : "Could not subscribe this address. Try again later.",
        }),
        {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
          status: isRateLimit ? 429 : 400,
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 }
    );
  } catch {
    console.error("subscribe-newsletter error");
    return new Response(
      JSON.stringify({
        success: false,
        error: "Nie udało się zapisać adresu. Spróbuj ponownie później.",
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
