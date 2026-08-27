import { renderHook, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useNotesToPngConversion } from './useNotesToPngConversion';

describe('useNotesToPngConversion', () => {
  test('validates valid JSON string', () => {
    const { result } = renderHook(() => useNotesToPngConversion());
    const validJson = JSON.stringify({ chapter: { title: "Test" }, pages: [] });

    act(() => {
      const res = result.current.validateJson(validJson);
      expect(res.valid).toBe(true);
    });

    expect(result.current.validationSuccess).toBe('Valid JSON format.');
    expect(result.current.validationError).toBe(null);
  });

  test('validates invalid JSON string', () => {
    const { result } = renderHook(() => useNotesToPngConversion());
    const invalidJson = '{"chapter": "Test",}';

    act(() => {
      const res = result.current.validateJson(invalidJson);
      expect(res.valid).toBe(false);
    });

    expect(result.current.validationError).toBeTruthy();
    expect(result.current.validationSuccess).toBe(null);
  });

  test('generates result for valid JSON', () => {
    const { result } = renderHook(() => useNotesToPngConversion());
    const jsonObj = { chapter: { title: "Ch1" }, pages: [{ items: [] }] };

    act(() => {
      result.current.handleGenerate(JSON.stringify(jsonObj));
    });

    expect(result.current.result).toEqual(jsonObj);
    expect(result.current.validationError).toBe(null);
  });

  test('resets state properly', () => {
    const { result } = renderHook(() => useNotesToPngConversion());
    const jsonObj = { chapter: { title: "Ch1" }, pages: [] };

    act(() => {
      result.current.handleGenerate(JSON.stringify(jsonObj));
    });
    expect(result.current.result).toBeTruthy();

    act(() => {
      result.current.handleReset();
    });

    expect(result.current.result).toBe(null);
    expect(result.current.validationError).toBe(null);
    expect(result.current.validationSuccess).toBe(null);
  });
});
