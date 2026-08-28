import { useState, useCallback, useRef } from 'react';
import { validateNotesJson } from '../lib/notesMode/validateSchema';
import { paginate } from '../lib/notesMode/paginate';

export function useNotesToPngConversion({ outputRef } = {}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [validationSuccess, setValidationSuccess] = useState(null);
  const latestRequestIdRef = useRef(0);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setValidationError(null);
    setValidationSuccess(null);
  }, []);

  const validateJson = useCallback((jsonString) => {
    if (!jsonString || !jsonString.trim()) {
      const msg = 'Please enter JSON content to validate.';
      setValidationError(msg);
      setValidationSuccess(null);
      return { valid: false, error: msg };
    }

    try {
      const parsed = JSON.parse(jsonString);
      const validation = validateNotesJson(parsed);
      if (!validation.valid) {
        const msg = validation.errors.map(err => `${err.path ? err.path + ': ' : ''}${err.message}`).join('\n');
        setValidationError(msg);
        setValidationSuccess(null);
        return { valid: false, error: msg };
      }

      setValidationError(null);
      setValidationSuccess('Valid JSON format.');
      return { valid: true, data: parsed };
    } catch (err) {
      const msg = err.message || 'Invalid JSON string.';
      setValidationError(msg);
      setValidationSuccess(null);
      return { valid: false, error: msg };
    }
  }, []);

  const handleGenerate = useCallback(async (jsonString) => {
    latestRequestIdRef.current += 1;
    const myRequestId = latestRequestIdRef.current;

    if (!jsonString || !jsonString.trim()) {
      if (myRequestId === latestRequestIdRef.current) {
        setValidationError('Please enter JSON content first.');
        setValidationSuccess(null);
        setError(null);
        setResult(null);
      }
      return;
    }

    setLoading(true);

    try {
      const parsed = JSON.parse(jsonString);
      const validation = validateNotesJson(parsed);
      if (!validation.valid) {
        if (myRequestId === latestRequestIdRef.current) {
          const msg = validation.errors.map(err => `${err.path ? err.path + ': ' : ''}${err.message}`).join('\n');
          setValidationError(msg);
          setValidationSuccess(null);
          setError(null);
          setResult(null);
          setLoading(false);
        }
        return;
      }

      // Flatten items from all pages in order
      const flattenedItems = [];
      let itemCounter = 0;
      if (Array.isArray(parsed.pages)) {
        parsed.pages.forEach(page => {
          if (Array.isArray(page.items)) {
            page.items.forEach(item => {
              itemCounter += 1;
              flattenedItems.push({
                ...item,
                id: item.id || `item-${itemCounter}`
              });
            });
          }
        });
      }

      if (flattenedItems.length === 0) {
        if (myRequestId === latestRequestIdRef.current) {
          setValidationError(null);
          setValidationSuccess(null);
          setError(null);
          setResult({
            chapter: parsed.chapter,
            pages: [],
            totalPages: 0
          });
          setLoading(false);
        }
        return;
      }

      // Calculate usable height budget per page in mm:
      // A4 height = 297mm
      // Top/bottom padding = 36mm (18mm * 2)
      // Footer = 12mm
      // Header region estimate = 24mm (title + subtitle + border + margin)
      // Total usable height per page = 297 - 36 - 12 - 24 = 225mm
      const usableHeightPerPage = 225;

      // Create DOM elements for measurement
      const itemsToMeasure = flattenedItems.map(item => {
        const dummyEl = document.createElement('div');
        dummyEl.className = 'note-item-wrapper';
        dummyEl.style.width = '174mm'; // 210mm - 36mm padding
        dummyEl.style.boxSizing = 'border-box';
        dummyEl.style.padding = '20px';
        dummyEl.style.marginBottom = '16px';

        // Approximate height calculation or fallback for JSDOM
        let heightEstimateMm = 40; // Default estimate per item
        if (item.question) {
          const qText = JSON.stringify(item.question);
          heightEstimateMm += Math.ceil(qText.length / 80) * 10;
        }
        if (item.solution) {
          const sText = JSON.stringify(item.solution);
          heightEstimateMm += Math.ceil(sText.length / 80) * 10;
        }
        if (JSON.stringify(item).includes('coordinate_graph')) {
          heightEstimateMm += 110; // SVG diagram height ~400px
        }

        dummyEl.style.height = `${heightEstimateMm}mm`;

        return {
          id: item.id,
          element: dummyEl,
          rawItem: item
        };
      });

      const { pages: pageItemIds, overflowItems } = await paginate(itemsToMeasure, {
        usableHeightPerPage,
        unit: 'mm'
      });

      if (myRequestId !== latestRequestIdRef.current) return;

      const itemMap = new Map(flattenedItems.map(item => [item.id, item]));

      const generatedPages = pageItemIds.map((idList, pageIdx) => ({
        pageIndex: pageIdx,
        isOverflow: false,
        items: idList.map(id => itemMap.get(id))
      }));

      // If overflow items exist, render them on separate dedicated overflow page(s)
      if (overflowItems.length > 0) {
        overflowItems.forEach((id, idx) => {
          generatedPages.push({
            pageIndex: generatedPages.length,
            isOverflow: true,
            items: [itemMap.get(id)]
          });
        });
      }

      setValidationError(null);
      setValidationSuccess(null);
      setError(null);
      setResult({
        chapter: parsed.chapter,
        pages: generatedPages,
        totalPages: generatedPages.length
      });
      setLoading(false);

      setTimeout(() => {
        outputRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      if (myRequestId === latestRequestIdRef.current) {
        const msg = err.message || 'Invalid JSON format.';
        setValidationError(msg);
        setValidationSuccess(null);
        setError(null);
        setResult(null);
        setLoading(false);
      }
    }
  }, [outputRef]);

  return {
    loading,
    result,
    error,
    validationError,
    validationSuccess,
    setError,
    setValidationError,
    validateJson,
    handleGenerate,
    handleReset,
  };
}
