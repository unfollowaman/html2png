# Mermaid Bundle Size Investigation Report

## 1. Bundle Size Contribution

Based on a standard `npm run build` using Vite for this project, the Mermaid dependency significantly contributes to the overall bundle size.

The build artifact for Mermaid (`dist/assets/vendor-mermaid-[hash].js`) has the following size footprint:
* **Uncompressed:** ~2,190 kB (2.19 MB)
* **Gzipped:** ~551 kB

This chunk is generated due to the `vite.config.js` manual chunk configuration, which isolates all `mermaid` related modules into `vendor-mermaid`.

## 2. Supported Diagram Types

Mermaid supports many diagram types (flowcharts, sequence diagrams, state diagrams, mindmaps, class diagrams, etc.).
By reviewing `src/components/InputCard.jsx` and `src/hooks/useMermaidToPngConversion.js`, it is clear that this application functions as a general-purpose converter. It takes an arbitrary raw text string provided by the user in a `<textarea>` and feeds it directly into `mermaid.render(uniqueId, mermaidCodeString)`.

While the sample code loaded via `loadSample()` only provides a `graph TD` flowchart, the user is fundamentally allowed and expected to paste *any* valid Mermaid syntax. Therefore, the project inherently **supports all diagram types** that Mermaid supports by default.

## 3. Tree-shaking and Import Alternatives

Mermaid uses dynamic chunk loading under the hood. When importing the standard `mermaid` package, it acts as a generic orchestrator that registers lazy loaders for all of its diagram definitions. Vite statically traces these dynamic imports and includes all possible diagram chunks into the `vendor-mermaid` bundle.

It is theoretically possible to bypass this generic entry point and manually register only a subset of diagrams (e.g., using `import mermaid from 'mermaid/dist/mermaid.core.mjs'` and `registerDiagram(...)`). This would allow tree-shaking and meaningfully reduce the shipped bundle size.

However, doing so would fundamentally degrade the application's capabilities. A user attempting to paste a sequence diagram or mindmap into the converter would encounter a runtime error because the corresponding diagram renderer was stripped from the build. Since this tool aims to be a generic code-to-PNG utility, limiting the supported formats is not an acceptable tradeoff.

## 4. Custom Font Injection Logic

The project performs a custom pass on the output SVG (`useMermaidToPngConversion.js`) via `DOMParser` to manually embed Arya and Playfair Display base64 font rules into a `<style>` tag and add CSS padding adjustments for `<i>` tags inside `<foreignObject>`.

Because this font injection operates purely on the post-rendered SVG string (after `mermaid.render()` has successfully returned), changing how Mermaid modules are imported or structured would not inherently break this logic. However, given the conclusion in step 3, such an import restructuring is ill-advised anyway.

## 5. Conclusion and Recommendation

**Recommendation: Leave as-is.**

* **Reasoning:** The application relies on the full breadth of Mermaid diagram types since it takes unstructured user input. Tree-shaking specific diagrams out of the bundle would arbitrarily break functionality for users attempting to convert non-registered diagram types.
* **Current Optimizations:** The project has already correctly implemented the most sensible optimization: lazy-loading. In `useMermaidToPngConversion.js`, `mermaid` is dynamically imported (`await import('mermaid')`), meaning the heavy 2.19 MB chunk is **not** downloaded when a user merely visits the page or uses the HTML/LaTeX conversion modes. The chunk is only fetched when the user explicitly triggers a Mermaid conversion.

Therefore, the current implementation achieves the best possible balance between full feature support and optimized initial page load performance.
## Confirmation

I confirm that no source files were modified during this investigation. Only this file, `AUDIT_MERMAID_BUNDLE_INVESTIGATION.md`, was created.
