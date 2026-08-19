import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/render-flow/', // GitHub Pages repo name — adjust if repo name differs
  build: {
    chunkSizeWarningLimit: 3000,
    modulePreload: {
      resolveDependencies(filename, deps) {
        return deps.filter(
          (dep) => !dep.includes('vendor-katex') && !dep.includes('vendor-mermaid')
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('katex')) {
              return 'vendor-katex';
            }
            if (id.includes('mermaid')) {
              return 'vendor-mermaid';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
