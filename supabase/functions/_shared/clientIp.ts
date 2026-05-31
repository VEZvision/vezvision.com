export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (!forwarded) return "unknown";

  const firstIp = forwarded.split(",")[0]?.trim();
  if (firstIp && /^[\d.a-fA-F:]+$/.test(firstIp)) {
    return firstIp.slice(0, 45);
  }

  return "unknown";
}
