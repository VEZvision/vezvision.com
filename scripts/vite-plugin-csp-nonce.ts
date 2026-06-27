import type { Plugin } from "vite";

/**
 * Production: removes the Vite HMR inline script from the production build.
 * Dev: no transformations (HMR script stays for dev experience).
 */
export function cspNoncePlugin(): Plugin {
  return {
    name: "vez-csp-nonce",
    transformIndexHtml(html, ctx) {
      if (ctx.server) {
        return html;
      }

      return html.replace(
        /<script type="module">\s*if \(import\.meta\.hot[\s\S]*?<\/script>\s*/i,
        "",
      );
    },
  };
}
