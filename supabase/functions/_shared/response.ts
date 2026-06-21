import type { getCorsHeaders } from "./cors.ts";

type CorsFn = typeof getCorsHeaders;

export function jsonResponse(
  corsHeaders: ReturnType<CorsFn>,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

export function errorResponse(
  corsHeaders: ReturnType<CorsFn>,
  error: string,
  status: number,
  field?: string,
): Response {
  return jsonResponse(
    corsHeaders,
    { success: false, error, ...(field ? { field } : {}) },
    status,
  );
}

export function successResponse(
  corsHeaders: ReturnType<CorsFn>,
  data: Record<string, unknown>,
  status = 200,
): Response {
  return jsonResponse(corsHeaders, { success: true, ...data }, status);
}
