import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getClientIp } from "../_shared/clientIp.ts";
import { buildEdgeRateLimitKey } from "../_shared/rateLimitKey.ts";

interface CodeInjectionValue {
  head?: unknown;
  body?: unknown;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json",
          Allow: "GET, POST, OPTIONS",
        },
        status: 405,
      },
    );
  }

  try {
    const clientIp = getClientIp(req);
    const rateLimitKey = await buildEdgeRateLimitKey(
      "edge-code-injection",
      req,
      clientIp,
    );
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: edgeRateLimitRows, error: edgeRateError } =
      await supabase.rpc("consume_rate_limit", {
        p_key: rateLimitKey,
        p_max_requests: 30,
        p_window_ms: 60000,
      });

    const edgeRateLimit = Array.isArray(edgeRateLimitRows)
      ? edgeRateLimitRows[0]
      : edgeRateLimitRows;

    if (edgeRateError || !edgeRateLimit?.allowed) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded" }),
        {
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
          status: 429,
        },
      );
    }

    const { data, error } = await supabase
      .from("vv_site_settings")
      .select("value")
      .eq("key", "code_injection")
      .maybeSingle();

    if (error) {
      throw error;
    }

    const settings = data?.value as CodeInjectionValue | null;

    return new Response(
      JSON.stringify({
        success: true,
        head: asString(settings?.head),
        body: asString(settings?.body),
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("get-code-injection error", err);
    return new Response(JSON.stringify({ success: true, head: "", body: "" }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 200,
    });
  }
});
