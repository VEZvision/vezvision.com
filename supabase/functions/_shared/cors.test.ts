import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { getCorsHeaders, hasTrustedBrowserOrigin } from "./cors.ts";

Deno.test("getCorsHeaders reflects allowed origin", () => {
  const req = new Request("https://example.com", {
    headers: { origin: "https://vezvision.com" },
  });
  const headers = getCorsHeaders(req);
  assertEquals(headers["Access-Control-Allow-Origin"], "https://vezvision.com");
});

Deno.test("hasTrustedBrowserOrigin rejects missing origin", () => {
  const req = new Request("https://example.com");
  assertEquals(hasTrustedBrowserOrigin(req), false);
});

Deno.test("hasTrustedBrowserOrigin accepts production origin", () => {
  const req = new Request("https://example.com", {
    headers: { origin: "https://www.vezvision.com" },
  });
  assertEquals(hasTrustedBrowserOrigin(req), true);
});
