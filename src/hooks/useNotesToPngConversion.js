import { useState, useCallback, useRef } from 'react';

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

  const handleGenerate = useCallback((jsonString) => {
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

    try {
      const parsed = JSON.parse(jsonString);
      if (myRequestId === latestRequestIdRef.current) {
        setValidationError(null);
        setValidationSuccess(null);
        setError(null);
        setResult(parsed);
        setTimeout(() => {
          outputRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err) {
      if (myRequestId === latestRequestIdRef.current) {
        const msg = err.message || 'Invalid JSON format.';
        setValidationError(msg);
        setValidationSuccess(null);
        setError(null);
        setResult(null);
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
