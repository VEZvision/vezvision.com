import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { cspNoncePlugin } from "./scripts/vite-plugin-csp-nonce.ts";
import { imagetools } from "vite-imagetools";
import { compression } from "vite-plugin-compression2";
import reactCompiler from "babel-plugin-react-compiler";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  define: {
    "import.meta.env.VITE_ENABLE_E2E_ROUTES": JSON.stringify(
      process.env.E2E_BUILD === "1" ? "true" : "false",
    ),
  },
  server: {
    host: "0.0.0.0",
    port: 5174,
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@shared": path.resolve(rootDir, "shared"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
    esbuild: {
      drop: process.env.NODE_ENV === "production" ? ["debugger"] : [],
      pure:
        process.env.NODE_ENV === "production"
          ? ["console.log", "console.info", "console.debug", "console.warn"]
          : [],
      target: "es2022",
    },
  },
  css: {
    minify: "lightningcss",
  },
  build: {
    target: "es2022",
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? "hidden" : false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-dom") ||
              (id.includes("react") &&
                !id.includes("react-router") &&
                !id.includes("react-helmet") &&
                !id.includes("react-markdown") &&
                !id.includes("lucide-react"))
            )
              return "vendor-react";
            if (id.includes("react-router")) return "vendor-router";
            if (id.includes("react-helmet")) return "vendor-helmet";
            if (
              id.includes("react-markdown") ||
              id.includes("remark") ||
              id.includes("rehype") ||
              id.includes("micromark") ||
              id.includes("unified")
            )
              return "vendor-markdown";
            if (id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("@tanstack/react-query")) return "vendor-query";
            if (id.includes("dompurify")) return "vendor-dompurify";
            if (id.includes("sonner")) return "vendor-sonner";
            if (id.includes("zod")) return "vendor-zod";
            if (id.includes("lenis")) return "vendor-lenis";
            if (id.includes("lucide-react")) return "vendor-icons";
          }
        },
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [[reactCompiler, { target: "19" }]],
      },
    }),
    tsconfigPaths(),
    cspNoncePlugin(),
    imagetools(),
    compression({
      algorithms: ["gzip", "brotliCompress"],
      include: [/\.(js|css|html|svg|json)$/],
      threshold: 1024,
    }),
  ],
});
