interface TurnstileVerifyResponse {
  success?: boolean;
}

function isDeployedEdge(): boolean {
  return Boolean(Deno.env.get("DENO_DEPLOYMENT_ID")?.trim());
}

/** When TURNSTILE_SECRET_KEY is unset, verification is skipped in local dev only. */
export async function verifyTurnstileToken(
  token: unknown,
  remoteIp?: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret?.trim()) {
    if (isDeployedEdge()) {
      return { ok: false, reason: "turnstile_not_configured" };
    }
    return { ok: true };
  }

  if (typeof token !== "string" || !token.trim()) {
    return { ok: false, reason: "missing_turnstile_token" };
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token.trim(),
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      }),
    });

    const data = (await response.json()) as TurnstileVerifyResponse;
    if (!response.ok || data.success !== true) {
      return { ok: false, reason: "turnstile_failed" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "turnstile_unreachable" };
  }
}
