import type { Plugin } from "vite";

/**
 * Production: injects preconnect to Supabase origin in index.html.
 * Removes the Vite HMR inline script from the production build.
 * Dev: no transformations (HMR script stays for dev experience).
 */
export function cspNoncePlugin(): Plugin {
  return {
    name: "vez-csp-nonce",
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
        );

      return next;
    },
  };
}
