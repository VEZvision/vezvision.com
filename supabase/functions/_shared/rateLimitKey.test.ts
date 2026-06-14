import { assertEquals } from "jsr:@std/assert@1";
import { buildEdgeRateLimitKey, sha256Hex16 } from "./rateLimitKey.ts";

Deno.test("sha256Hex16 is stable", async () => {
  const a = await sha256Hex16("edge-test");
  const b = await sha256Hex16("edge-test");
  assertEquals(a, b);
  assertEquals(a.length, 16);
});

Deno.test("buildEdgeRateLimitKey scopes fingerprint", async () => {
  const req = new Request("https://example.com", {
    headers: { "user-agent": "test-agent", "accept-language": "en-US" },
  });
  const key = await buildEdgeRateLimitKey("edge-demo", req, "127.0.0.1");
  assertEquals(key.startsWith("edge-demo:"), true);
});
