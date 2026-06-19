import { createHmac } from "node:crypto";

export function computeWebhookSignature(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function buildWebhookHeaders(
  body: string,
  secret: string,
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-webhook-signature": computeWebhookSignature(body, secret),
  };
}
