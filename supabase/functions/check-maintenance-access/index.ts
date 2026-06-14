import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders, hasTrustedBrowserOrigin } from "../_shared/cors.ts";
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

    const [{ data: maintenanceData, error: maintenanceError }, { data: allowlistData, error: allowlistError }] =
      await Promise.all([
        supabase
          .from("vv_site_settings")
          .select("value")
          .eq("key", "maintenance_mode")
          .maybeSingle(),
        supabase
          .from("vv_site_settings")
          .select("value")
          .eq("key", "maintenance_allowlist")
          .maybeSingle(),
      ]);

    if (maintenanceError) {
      throw maintenanceError;
    }

    if (allowlistError) {
      throw allowlistError;
    }

    const settings = maintenanceData?.value as { enabled?: boolean } | null;
    const maintenanceEnabled = settings?.enabled === true;
    const allowedIps = asStringArray(
      (allowlistData?.value as { allowedIps?: unknown } | null)?.allowedIps,
    );

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
    const bypass = hasTrustedBrowserOrigin(req) && allowedIps.includes(clientIp);

    return new Response(
      JSON.stringify({ success: true, maintenance: true, bypass }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, maintenance: true, bypass: false }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 },
    );
  }
});
