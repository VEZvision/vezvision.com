import crypto from "node:crypto";
import type { Plugin, ConfigEnv } from "vite";

/**
 * Production: per-build CSP nonce in index.html meta + import.meta.env.VITE_CSP_NONCE.
 * Dev: keeps unsafe-inline fallback (no meta CSP injection).
 */
export function cspNoncePlugin(): Plugin {
  let nonce = "";

  return {
    name: "vez-csp-nonce",
    config(_config: unknown, { command }: ConfigEnv) {
      if (command === "build") {
        nonce = crypto.randomBytes(16).toString("base64");
      }

      return {
        define: {
          "import.meta.env.VITE_CSP_NONCE": JSON.stringify(nonce),
        },
      };
    },
    transformIndexHtml(html, ctx) {
      if (ctx.server) {
        return html;
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
      const preconnectSupabase = supabaseUrl
        ? `    <link rel="preconnect" href="${new URL(supabaseUrl).origin}" crossorigin>\n`
        : "";
      const next = html
        .replace(
          '<meta charset="UTF-8" />',
          `<meta charset="UTF-8" />\n${preconnectSupabase}`,
        )
        .replace(
          /<script type="module">\s*if \(import\.meta\.hot[\s\S]*?<\/script>\s*/i,
          "",
        )
        .replace(
          /<link rel="preload" href="https:\/\/fonts\.googleapis\.com[^>]*onload="[^"]*"[^>]*>/i,
          '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">',
        )
        .replace(
          /<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=Playfair[^>]*onload="[^"]*"[^>]*>/i,
          '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap">',
        );

      return next;
    },
  };
}
