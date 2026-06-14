import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getClientIp } from "../_shared/clientIp.ts";
import { buildEdgeRateLimitKey } from "../_shared/rateLimitKey.ts";

const TOKEN_PATTERN = /^[a-f0-9]{32,128}$/i;

interface UnsubscribeRpcResult {
  success?: boolean;
  email?: string;
  error?: string;
  message?: string;
}

function parseRpcResult(data: unknown): UnsubscribeRpcResult {
  if (!data || typeof data !== "object") return {};
  const record = data as Record<string, unknown>;
  return {
    success: record.success === true,
    email: typeof record.email === "string" ? record.email : undefined,
    error: typeof record.error === "string" ? record.error : typeof record.message === "string" ? record.message : undefined,
  };
}

function normalizeToken(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const token = value.trim();
  if (!token || token.length > 128 || !TOKEN_PATTERN.test(token)) return null;
  return token;
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
      },
    );
  }

  try {
    const clientIp = getClientIp(req);
    const rateLimitKey = await buildEdgeRateLimitKey("edge-unsubscribe", req, clientIp);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: edgeRateLimitRows, error: edgeRateError } = await supabase.rpc("consume_rate_limit", {
      p_key: rateLimitKey,
      p_max_requests: 20,
      p_window_ms: 60000,
    });

    const edgeRateLimit = Array.isArray(edgeRateLimitRows) ? edgeRateLimitRows[0] : edgeRateLimitRows;

    if (edgeRateError || !edgeRateLimit?.allowed) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded" }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 429 },
      );
    }

    const body = await req.json();
    const token = normalizeToken(body?.token);

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid or missing unsubscribe token.",
        }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 400 },
      );
    }

    const { data, error } = await supabase.rpc("unsubscribe_by_token", {
      token_input: token,
    });

    if (error) {
      console.error("unsubscribe_by_token RPC error");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not process unsubscribe request. Try again later.",
        }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 400 },
      );
    }

    const result = parseRpcResult(data);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || "Invalid or expired unsubscribe link.",
        }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 400 },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        email: result.email ?? null,
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 },
    );
  } catch {
    console.error("unsubscribe-newsletter error");
    return new Response(
      JSON.stringify({
        success: false,
        error: "Could not process unsubscribe request. Try again later.",
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 500 },
    );
  }
});
