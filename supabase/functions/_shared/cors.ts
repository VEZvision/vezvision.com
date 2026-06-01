const PRODUCTION_ORIGINS = [
  "https://vezvision.com",
  "https://www.vezvision.com",
] as const;

const LOCAL_ORIGINS = [
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
] as const;

const ALLOWED_ORIGINS = [...PRODUCTION_ORIGINS, ...LOCAL_ORIGINS];

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin as typeof ALLOWED_ORIGINS[number])
    ? origin
    : PRODUCTION_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
}
