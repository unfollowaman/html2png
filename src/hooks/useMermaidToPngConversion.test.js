import { describe, it, expect } from 'vitest';
import { arrayBufferToBase64 } from './useMermaidToPngConversion';

describe('arrayBufferToBase64', () => {
  it('correctly converts empty ArrayBuffer', () => {
    const buffer = new Uint8Array([]).buffer;
    expect(arrayBufferToBase64(buffer)).toBe('');
  });

  it('correctly converts small ArrayBuffer', () => {
    const text = 'Hello, World!';
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const expected = btoa(text);
    expect(arrayBufferToBase64(bytes.buffer)).toBe(expected);
  });

  it('correctly converts large ArrayBuffer spanning multiple chunks', () => {
    // Generate 100KB of random-ish bytes
    const size = 100 * 1024;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = i % 256;
    }
    const expected = Buffer.from(bytes).toString('base64');
    expect(arrayBufferToBase64(bytes.buffer)).toBe(expected);
  });

  it('benchmark arrayBufferToBase64 performance', () => {
    // Generate 2MB buffer simulating font file sizes
    const size = 2 * 1024 * 1024;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = (i * 31 + 17) % 256;
    }

    // Warmup
    arrayBufferToBase64(bytes.buffer);

    const iterations = 50;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      arrayBufferToBase64(bytes.buffer);
    }
    const totalTime = performance.now() - start;
    const avgTime = totalTime / iterations;

    console.log(`[Benchmark arrayBufferToBase64] Total: ${totalTime.toFixed(2)}ms, Avg: ${avgTime.toFixed(4)}ms over ${iterations} runs (${size / 1024 / 1024}MB buffer)`);
    expect(totalTime).toBeGreaterThan(0);
  });
});
