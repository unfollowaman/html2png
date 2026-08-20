import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inlineResources } from './inlineResources';

describe('inlineResources', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('inlines images and CSS url() resources', async () => {
    const mockImageBlob = new Blob(['fake-image-data'], { type: 'image/png' });

    globalThis.fetch = vi.fn().mockImplementation((url) => {
      if (url.endsWith('.png')) {
        return Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(mockImageBlob),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const html = `
      <div>
        <img src="https://example.com/image.png" />
      </div>
    `;

    const { html: resultHtml, failedUrls } = await inlineResources(html);

    expect(failedUrls).toEqual([]);
    expect(resultHtml).toContain('data:image/png;base64,');
  });

  it('caches network calls for duplicate resources', async () => {
    let fetchCount = 0;
    const mockImageBlob = new Blob(['fake-image-data'], { type: 'image/png' });

    globalThis.fetch = vi.fn().mockImplementation((url) => {
      fetchCount++;
      if (url.endsWith('.png')) {
        return Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(mockImageBlob),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const uniqueUrl = `https://example.com/logo-${Date.now()}.png`;
    const html = `
      <div>
        <img src="${uniqueUrl}" />
        <img src="${uniqueUrl}" />
        <img src="${uniqueUrl}" />
        <div style="background-image: url('${uniqueUrl}')"></div>
      </div>
    `;

    const startTime = performance.now();
    const { html: resultHtml, failedUrls } = await inlineResources(html);
    const duration = performance.now() - startTime;

    expect(failedUrls).toEqual([]);
    console.log(`[Benchmark With Cache] fetch count for 4 duplicate URLs: ${fetchCount}, duration: ${duration.toFixed(2)}ms`);
    // With cache, fetchCount should be exactly 1 despite 4 references in the HTML
    expect(fetchCount).toBe(1);
  });
});
