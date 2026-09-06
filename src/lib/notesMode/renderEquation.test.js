import { describe, it, expect, vi } from 'vitest';
import katex from 'katex';
import { renderEquation } from './renderEquation';

describe('renderEquation LaTeX-to-rendered-equation utility', () => {
  it('1. Inline equation: "x^2 + y^2 = r^2" renders correctly with displayMode: false', () => {
    const res = renderEquation('x^2 + y^2 = r^2', { displayMode: false });
    expect(res.error).toBe(false);
    expect(res.html).toContain('katex');
    expect(res.html).not.toContain('katex-display');
    expect(res.element).toBeInstanceOf(HTMLElement);
    expect(res.element.className).toContain('inline-equation');
  });

  it('2. Display equation: "\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}" renders correctly with displayMode: true', () => {
    const res = renderEquation('\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', { displayMode: true });
    expect(res.error).toBe(false);
    expect(res.html).toContain('katex-display');
    expect(res.element).toBeInstanceOf(HTMLElement);
    expect(res.element.className).toContain('display-equation');
  });

  it('3. Square root: "\\sqrt{x^2+y^2}=5" renders correctly', () => {
    const res = renderEquation('\\sqrt{x^2+y^2}=5', { displayMode: false });
    expect(res.error).toBe(false);
    expect(res.html).toContain('sqrt');
    expect(res.element).toBeInstanceOf(HTMLElement);
  });

  it('4. Matrix: a 2x2 matrix using \\begin{matrix}...\\end{matrix} renders correctly', () => {
    const latex = '\\begin{matrix} a & b \\\\ c & d \\end{matrix}';
    const res = renderEquation(latex, { displayMode: true });
    expect(res.error).toBe(false);
    expect(res.html).toContain('matrix');
    expect(res.element).toBeInstanceOf(HTMLElement);
  });

  it('5. Greek symbols and subscripts/superscripts: "\\theta_1^2 + \\alpha" renders correctly', () => {
    const res = renderEquation('\\theta_1^2 + \\alpha', { displayMode: false });
    expect(res.error).toBe(false);
    expect(res.html).toContain('mord');
    expect(res.element).toBeInstanceOf(HTMLElement);
  });

  it('6. Invalid LaTeX: unclosed brace "\\frac{1{2}" returns flagged error object, does not throw', () => {
    expect(() => {
      const res = renderEquation('\\frac{1{2}', { displayMode: false });
      expect(res.error).toBe(true);
      expect(typeof res.message).toBe('string');
      expect(res.message).toMatch(/KaTeX parse error/i);
    }).not.toThrow();
  });

  it('7. Non-string input: returns error object when input is not a string', () => {
    const invalidInputs = [null, undefined, 123, {}, [], true];
    invalidInputs.forEach((input) => {
      const res = renderEquation(input);
      expect(res).toEqual({
        error: true,
        message: 'Invalid input: LaTeX expression must be a string.'
      });
    });
  });

  it('8. Sanitizes HTML output with DOMPurify preventing unsanitized HTML/script injection', () => {
    const res = renderEquation('a + b = c', { displayMode: false });
    expect(res.error).toBe(false);
    expect(res.element.innerHTML).not.toContain('<script');
    expect(res.element.innerHTML).not.toContain('onerror=');
    expect(res.html).toBe(res.element.innerHTML);
  });

  it('9. Fallback error message: returns "LaTeX parsing error." when thrown error lacks a message property', () => {
    const spy = vi.spyOn(katex, 'renderToString').mockImplementationOnce(() => {
      throw {};
    });

    const res = renderEquation('x + y');
    expect(res).toEqual({
      error: true,
      message: 'LaTeX parsing error.'
    });

    spy.mockRestore();
  });
});
