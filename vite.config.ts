import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  build: {
    sourcemap: 'hidden',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@sentry')) return 'vendor-sentry';
            if (id.includes('lenis')) return 'vendor-lenis';
            if (id.includes('lucide-react')) return 'vendor-icons';
          }
        }
      }
    }
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
})
