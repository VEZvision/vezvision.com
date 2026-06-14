/** Edge bundle — logic mirrored in shared/rateLimitKey.ts */

export async function sha256Hex16(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

export async function buildEdgeRateLimitKey(
  scope: string,
  req: Pick<Request, "headers">,
  clientIp: string,
): Promise<string> {
  const userAgent = (req.headers.get("user-agent") ?? "unknown").slice(0, 120);
  const acceptLanguage = (req.headers.get("accept-language") ?? "").slice(0, 40);
  const fingerprint = await sha256Hex16(`${clientIp}|${userAgent}|${acceptLanguage}`);
  return `${scope}:${fingerprint}`;
}
