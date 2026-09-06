import katex from 'katex';
import DOMPurify from 'dompurify';
import 'katex/dist/katex.min.css';

/**
 * Renders a LaTeX string into a KaTeX DOM element and HTML string.
 *
 * @param {string} latex - The LaTeX formula string to render.
 * @param {Object} [options={}] - Options object.
 * @param {boolean} [options.displayMode=false] - Render in display/block mode if true, inline mode if false.
 * @returns {{ error: false, element: HTMLElement, html: string } | { error: true, message: string }} Result object.
 */
export function renderEquation(latex, options = {}) {
  const displayMode = Boolean(options?.displayMode);

  if (typeof latex !== 'string') {
    return {
      error: true,
      message: 'Invalid input: LaTeX expression must be a string.'
    };
  }

  try {
    const rawHtml = katex.renderToString(latex, {
      displayMode,
      throwOnError: true,
      trust: false
    });

    const cleanHtml = DOMPurify.sanitize(rawHtml);

    const container = document.createElement('span');
    container.className = displayMode ? 'rendered-equation display-equation' : 'rendered-equation inline-equation';
    container.innerHTML = cleanHtml;

    return {
      error: false,
      element: container,
      html: cleanHtml
    };
  } catch (err) {
    return {
      error: true,
      message: err.message || 'LaTeX parsing error.'
    };
  }
}
