import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  define: {
    'import.meta.env.VITE_ENABLE_E2E_ROUTES': JSON.stringify(
      process.env.E2E_BUILD === '1' ? 'true' : 'false',
    ),
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  build: {
    sourcemap: 'hidden',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || (id.includes('react') && !id.includes('react-router') && !id.includes('react-helmet') && !id.includes('react-markdown') && !id.includes('lucide-react'))) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('react-helmet')) return 'vendor-helmet';
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || id.includes('micromark') || id.includes('unified')) return 'vendor-markdown';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('@supabase')) return 'vendor-supabase';
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
});
