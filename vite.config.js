import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function inlineCssPlugin() {
  return {
    name: 'inline-css-plugin',
    enforce: 'post',
    generateBundle(options, bundle) {
      let indexHtmlKey = null;
      let cssKey = null;

      for (const [key] of Object.entries(bundle)) {
        if (key.endsWith('index.html')) indexHtmlKey = key;
        if (key.startsWith('assets/index-') && key.endsWith('.css')) cssKey = key;
      }

      if (indexHtmlKey && cssKey) {
        const htmlFile = bundle[indexHtmlKey];
        const cssFile = bundle[cssKey];

        const cssContent = cssFile.source;
        const cssFileName = cssKey.split('/').pop();
        const escapedFileName = cssFileName.replace('.', '\\.');
        const linkRegex = new RegExp('<link[^>]*href=["\'][^"\']*' + escapedFileName + '["\'][^>]*>', 'g');

        htmlFile.source = htmlFile.source.replace(
          linkRegex,
          `<style>${cssContent}</style>`
        );

        delete bundle[cssKey];
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), inlineCssPlugin()],
  base: '/render-flow/', // GitHub Pages repo name — adjust if repo name differs
  build: {
    chunkSizeWarningLimit: 3000,
    modulePreload: {
      resolveDependencies(filename, deps) {
        return deps.filter(
          (dep) =>
            !dep.includes('vendor-katex') &&
            !dep.includes('vendor-mermaid') &&
            !dep.includes('vendor-html-to-image')
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('node_modules/mermaid') ||
              id.includes('node_modules/@mermaid-js')
            ) {
              return 'vendor-mermaid';
            }
            if (id.includes('node_modules/katex')) {
              return 'vendor-katex';
            }
            if (id.includes('node_modules/html-to-image')) {
              return 'vendor-html-to-image';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
