import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (!forwarded) return "unknown";

  const firstIp = forwarded.split(",")[0]?.trim();
  if (firstIp && /^[\d.a-fA-F:]+$/.test(firstIp)) {
    return firstIp.slice(0, 45);
  }

  return "unknown";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    const clientIp = getClientIp(req);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const email = body?.email;
    const language = body?.language === 'en' ? 'en' : 'pl';
    const source = typeof body?.source === 'string' ? body.source.trim().slice(0, 50) : null;

    if (!email || typeof email !== "string" || !email.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: language === "pl" ? "Podaj adres email." : "Enter your email address." }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { data: id, error } = await supabase.rpc("safe_insert_newsletter_subscriber", {
      p_email: String(email).trim().toLowerCase(),
      p_client_ip: clientIp,
      p_language: language,
      p_source: source,
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
              : msg,
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
