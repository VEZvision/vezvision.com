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

function parseExtraOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_CORS_ORIGINS");
  if (!raw?.trim()) return [];

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => {
      if (!origin) return false;
      try {
        const url = new URL(origin);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    });
}

function getAllowedOrigins(): string[] {
  return [...PRODUCTION_ORIGINS, ...LOCAL_ORIGINS, ...parseExtraOrigins()];
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = allowedOrigins.includes(origin);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    Connection: "keep-alive",
  };

  if (isAllowed) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  return headers;
}

/** Browser requests include Origin; curl/scripts typically do not. */
export function hasTrustedBrowserOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  return getAllowedOrigins().includes(origin);
}
