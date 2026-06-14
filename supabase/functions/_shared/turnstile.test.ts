import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { verifyTurnstileToken } from "./turnstile.ts";

Deno.test("verifyTurnstileToken skips when secret unset locally", async () => {
  const original = Deno.env.get("TURNSTILE_SECRET_KEY");
  const originalDeploy = Deno.env.get("DENO_DEPLOYMENT_ID");
  Deno.env.delete("TURNSTILE_SECRET_KEY");
  Deno.env.delete("DENO_DEPLOYMENT_ID");

  try {
    const result = await verifyTurnstileToken("", "127.0.0.1");
    assertEquals(result.ok, true);
  } finally {
    if (original) Deno.env.set("TURNSTILE_SECRET_KEY", original);
    if (originalDeploy) Deno.env.set("DENO_DEPLOYMENT_ID", originalDeploy);
  }
});

Deno.test("verifyTurnstileToken rejects missing token when secret set", async () => {
  const original = Deno.env.get("TURNSTILE_SECRET_KEY");
  const originalDeploy = Deno.env.get("DENO_DEPLOYMENT_ID");
  Deno.env.set("TURNSTILE_SECRET_KEY", "test-secret");
  Deno.env.set("DENO_DEPLOYMENT_ID", "deploy-1");

  try {
    const result = await verifyTurnstileToken("", "127.0.0.1");
    assertEquals(result.ok, false);
  } finally {
    if (original) Deno.env.set("TURNSTILE_SECRET_KEY", original);
    else Deno.env.delete("TURNSTILE_SECRET_KEY");
    if (originalDeploy) Deno.env.set("DENO_DEPLOYMENT_ID", originalDeploy);
    else Deno.env.delete("DENO_DEPLOYMENT_ID");
  }
});
