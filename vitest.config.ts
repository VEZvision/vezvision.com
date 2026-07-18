import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    exclude: [
      "tests/e2e/**",
      "supabase/functions/**",
      "scripts/**",
      "**/node_modules/**",
      "dist/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/services/**", "src/utils/**", "shared/**"],
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
