import { useState, useCallback, useRef } from 'react';
import { renderImageToPngBlobUrl } from '../utils/canvasToBlob.js';

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

    let objectUrl = null;
    let resultObjectUrl = null;

    try {
      // Step 1: Dynamic import and initialize
      if (!window.MathJax) {
        window.MathJax = {
          tex: { packages: { '[-]': ['require', 'autoload'] } },
          options: {
            enableMenu: false,
            enableAssistiveMml: false,
            enableSpeech: false,
            enableBraille: false,
            menuOptions: {
              settings: { assistiveMml: false }
            }
          },
          startup: { typeset: false }
        };
      }

      await import('mathjax/es5/tex-svg.js');

      if (window.MathJax.startup && window.MathJax.startup.promise) {
        await window.MathJax.startup.promise;
      }
      if (!window.MathJax.tex2svgPromise) {
        throw new Error("MathJax tex2svgPromise is not available. MathJax failed to load.");
      }

      if (myRequestId !== latestRequestIdRef.current) return;      // Step 2: Render SVG
      let svgElement;
      try {
        const container = await window.MathJax.tex2svgPromise(latexString, { display: true });
        svgElement = container.querySelector('svg');
        if (!svgElement) {
          throw new Error('Failed to find SVG element in MathJax output.');
        }

        // Check for MathJax errors in the SVG
        const errorNode = svgElement.querySelector('[data-mjx-error]') ||
                          svgElement.querySelector('g[data-mml-node="merror"]') ||
                          svgElement.querySelector('g[data-mml-node="mtext"][fill="red"]');
        if (errorNode) {
          throw new Error('Invalid LaTeX syntax.');
        }

      } catch (renderError) {
        if (myRequestId === latestRequestIdRef.current) {
          setParseError('LaTeX could not be parsed.');
          setLoading(false);
        }
        return;
      }

      if (myRequestId !== latestRequestIdRef.current) return;

      // Step 3: Extract dimensions
      let intrinsicWidth = null;
      let intrinsicHeight = null;

      // Add xmlns if missing before serializing
      if (!svgElement.getAttribute('xmlns')) {
         svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      let serializer = new XMLSerializer();
      let tempSvgString = serializer.serializeToString(svgElement);

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(tempSvgString, 'image/svg+xml');
      const parsedSvgElement = svgDoc.documentElement;

      const widthAttr = parsedSvgElement.getAttribute('width');
      const heightAttr = parsedSvgElement.getAttribute('height');

      const exToPx = 12; // Approximation: 1ex ~ 12px

      if (widthAttr && widthAttr.endsWith('ex') && heightAttr && heightAttr.endsWith('ex')) {
        intrinsicWidth = parseFloat(widthAttr) * exToPx;
        intrinsicHeight = parseFloat(heightAttr) * exToPx;
      } else {
        const viewBox = parsedSvgElement.getAttribute('viewBox');
        if (viewBox) {
          const parts = viewBox.split(/\s+|,/);
          if (parts.length >= 4) {
            intrinsicWidth = parseFloat(parts[2]) * (exToPx / 1000);
            intrinsicHeight = parseFloat(parts[3]) * (exToPx / 1000);
          }
        }
      }

      if (!intrinsicWidth || !intrinsicHeight || isNaN(intrinsicWidth) || isNaN(intrinsicHeight)) {
        intrinsicWidth = 800;
        intrinsicHeight = 200;
      }

      svgElement.setAttribute('width', intrinsicWidth + 'px');
      svgElement.setAttribute('height', intrinsicHeight + 'px');

      serializer = new XMLSerializer();
      const finalSvgString = serializer.serializeToString(svgElement);

      // Step 4: Create object URL
      const svgBlob = new Blob([finalSvgString], { type: 'image/svg+xml;charset=utf-8' });
      objectUrl = URL.createObjectURL(svgBlob);

      // Step 5: Load Image
      const img = new Image();

      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load SVG into image.'));
      });

      img.src = objectUrl;
      await imageLoadPromise;

      if (myRequestId !== latestRequestIdRef.current) return;

      // Step 6: Convert to blob and object URL
      const renderResult = await renderImageToPngBlobUrl(
        img,
        intrinsicWidth,
        intrinsicHeight,
        'Formula is too large to render (exceeds maximum canvas size). Try simplifying the expression or breaking it into smaller parts.',
        '#ffffff'
      );

      resultObjectUrl = renderResult.resultObjectUrl;
      const finalWidth = renderResult.finalWidth;
      const finalHeight = renderResult.finalHeight;

      // Step 8: Revoke SVG object URL
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;

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
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      if (myRequestId === latestRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [outputRef]);

  return { loading, result, error, parseError, setError, handleConvert, handleReset };
}
