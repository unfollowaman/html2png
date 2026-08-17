import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/render-flow/', // GitHub Pages repo name — adjust if repo name differs
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mathjax')) {
              return 'vendor-mathjax';
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
