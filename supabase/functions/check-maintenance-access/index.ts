import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getClientIp } from "../_shared/clientIp.ts";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json", Allow: "GET, POST, OPTIONS" },
        status: 405,
      },
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data, error } = await supabase
      .from("vv_site_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .eq("is_public", true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const settings = data?.value as { enabled?: boolean; allowedIps?: unknown } | null;
    const maintenanceEnabled = settings?.enabled === true;
    const allowedIps = asStringArray(settings?.allowedIps);

    if (!maintenanceEnabled) {
      return new Response(
        JSON.stringify({ success: true, maintenance: false, bypass: true }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
      );
    }

    if (allowedIps.length === 0) {
      return new Response(
        JSON.stringify({ success: true, maintenance: true, bypass: false }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
      );
    }

    const clientIp = getClientIp(req);
    const bypass = allowedIps.includes(clientIp);

    return new Response(
      JSON.stringify({ success: true, maintenance: true, bypass }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, maintenance: true, bypass: false }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 500 },
    );
  }
});
