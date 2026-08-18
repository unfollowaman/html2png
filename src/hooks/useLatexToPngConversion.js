import { useState, useCallback, useRef } from 'react';

// Use bundled import of KaTeX and its CSS for zero-backend client app
import 'katex/dist/katex.min.css';

export function useLatexToPngConversion({ outputRef }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [parseError, setParseError] = useState(null);
  const latestRequestIdRef = useRef(0);

  const handleReset = useCallback(() => {
    setParseError(null);
    setResult(null);
    setError(null);
  }, []);

  const handleConvert = useCallback(async (latexString) => {
    latestRequestIdRef.current += 1;
    const myRequestId = latestRequestIdRef.current;

    if (!latexString.trim()) {
      if (myRequestId === latestRequestIdRef.current) {
        setError('Please enter some LaTeX code first.');
      }
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setParseError(null);

    let resultObjectUrl = null;

    try {
      // Lazy load KaTeX to avoid blocking initial render
      const katexModule = await import('katex');
      const katex = katexModule.default || katexModule;

      if (myRequestId !== latestRequestIdRef.current) return;

      // Render KaTeX HTML
      let htmlContent;
      try {
        htmlContent = katex.renderToString(latexString, {
            displayMode: true,
            throwOnError: true
        });
      } catch (renderError) {
        if (myRequestId === latestRequestIdRef.current) {
          setParseError(renderError.message || 'LaTeX could not be parsed.');
          setLoading(false);
        }
        return;
      }

      if (myRequestId !== latestRequestIdRef.current) return;

      // Create offscreen container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-99999px';
      container.style.left = '-99999px';
      container.style.display = 'inline-block';
      container.style.margin = '0';
      container.style.padding = '0';

      container.innerHTML = htmlContent;
      document.body.appendChild(container);

      // Wait a tick for fonts/layout
      await new Promise(resolve => setTimeout(resolve, 0));
      if (document.fonts && document.fonts.ready) {
         await document.fonts.ready;
      }

      const rect = container.getBoundingClientRect();
      let intrinsicWidth = Math.ceil(rect.width);
      let intrinsicHeight = Math.ceil(rect.height);

      if (!intrinsicWidth || !intrinsicHeight || isNaN(intrinsicWidth) || isNaN(intrinsicHeight)) {
        intrinsicWidth = 800;
        intrinsicHeight = 200;
      }

      if (myRequestId !== latestRequestIdRef.current) {
         document.body.removeChild(container);
         return;
      }

      const DPI_SCALE = 2; // Matches previous behavior via canvasToBlob
      const finalWidth = intrinsicWidth * DPI_SCALE;
      const finalHeight = intrinsicHeight * DPI_SCALE;

      if (finalWidth * finalHeight > 200000000) {
          document.body.removeChild(container);
          throw new Error('Formula is too large to render (exceeds maximum canvas size). Try simplifying the expression or breaking it into smaller parts.');
      }

      // Use html-to-image
      let blob;
      try {
          const { toBlob } = await import('html-to-image');
          blob = await toBlob(container, {
              width: intrinsicWidth,
              height: intrinsicHeight,
              style: {
                  margin: '0',
                  padding: '0'
              },
              backgroundColor: '#ffffff',
              pixelRatio: DPI_SCALE
          });
      } finally {
          document.body.removeChild(container);
      }

      if (!blob) {
          throw new Error('Failed to create PNG blob.');
      }

      resultObjectUrl = URL.createObjectURL(blob);

      if (myRequestId === latestRequestIdRef.current) {
        setResult({ image: resultObjectUrl, width: finalWidth, height: finalHeight });
        setTimeout(() => {
          outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err) {
      if (myRequestId === latestRequestIdRef.current) {
        setError(err.message || 'An error occurred during conversion.');
      }
    } finally {
      if (myRequestId === latestRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [outputRef]);

  return { loading, result, error, parseError, setError, handleConvert, handleReset };
}
