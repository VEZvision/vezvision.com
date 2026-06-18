import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getClientIp } from "../_shared/clientIp.ts";
import { buildEdgeRateLimitKey } from "../_shared/rateLimitKey.ts";

function normalizeSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const slug = value.trim();
  if (!slug || slug.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
    return null;
  }
  return slug;
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

  try {
    const body = await req.json().catch(() => ({}));
    const slug = normalizeSlug(body?.slug ?? body?.p_post_slug);

    if (!slug) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid slug" }),
        {
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
          status: 400,
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const clientIp = getClientIp(req);
    const rateLimitKey = await buildEdgeRateLimitKey(
      "edge-blog-view",
      req,
      clientIp,
    );

    const { data: edgeRateLimitRows, error: edgeRateError } =
      await supabase.rpc("consume_rate_limit", {
        p_key: rateLimitKey,
        p_max_requests: 60,
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

    const { data, error } = await supabase.rpc("vv_blog_increment_views", {
      p_post_slug: slug,
      p_client_ip: clientIp,
    });

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: "Could not increment views" }),
        {
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
          status: 400,
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        views: typeof data === "number" ? data : 0,
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("increment-blog-view error", err);
    return new Response(
      JSON.stringify({ success: false, error: "Unexpected error" }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
