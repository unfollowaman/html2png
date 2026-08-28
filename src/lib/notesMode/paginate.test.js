import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { measureHeight, paginate } from './paginate';

/**
 * Helper to create a mock DOM element with specified height.
 * Attaches a getBoundingClientRect implementation if jsdom returns 0 for unrendered elements,
 * ensuring test height is reported accurately in px (assuming 96 DPI: 1mm = 3.779527559px).
 */
function createMockElement(heightMm, id = null) {
  const el = document.createElement('div');
  el.style.height = `${heightMm}mm`;
  if (id) el.id = id;

  const pxVal = heightMm * (96 / 25.4);
  el.getBoundingClientRect = () => ({
    width: 100,
    height: pxVal,
    top: 0,
    left: 0,
    right: 100,
    bottom: pxVal,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  return el;
}

describe('paginate & measureHeight standalone module', () => {
  let initialBodyChildCount;

  beforeEach(() => {
    initialBodyChildCount = document.body.children.length;
  });

  afterEach(() => {
    // Clean up any lingering body children if any test fails
  });

  test('Test Case 1: Five mock items of 40mm each, usableHeightPerPage: 100mm', async () => {
    const items = [
      { id: 'item1', element: createMockElement(40) },
      { id: 'item2', element: createMockElement(40) },
      { id: 'item3', element: createMockElement(40) },
      { id: 'item4', element: createMockElement(40) },
      { id: 'item5', element: createMockElement(40) },
    ];

    const result = await paginate(items, { usableHeightPerPage: 100, unit: 'mm' });

    expect(result.overflowItems).toEqual([]);
    expect(result.pages).toEqual([
      ['item1', 'item2'],
      ['item3', 'item4'],
      ['item5'],
    ]);

    // Verify no page total height exceeds usableHeightPerPage (100mm)
    for (const page of result.pages) {
      const pageHeight = page.length * 40;
      expect(pageHeight).toBeLessThanOrEqual(100);
    }
  });

  test('Test Case 2: A single mock item of 150mm with usableHeightPerPage: 100mm', async () => {
    const items = [
      { id: 'normal1', element: createMockElement(30) },
      { id: 'oversized', element: createMockElement(150) },
      { id: 'normal2', element: createMockElement(40) },
    ];

    const result = await paginate(items, { usableHeightPerPage: 100, unit: 'mm' });

    expect(result.overflowItems).toEqual(['oversized']);
    expect(result.pages).toEqual([
      ['normal1', 'normal2'],
    ]);
  });

  test('Test Case 3: Items of varying heights (30mm, 70mm, 20mm, 60mm) with usableHeightPerPage: 100mm', async () => {
    const items = [
      { id: 'v1', element: createMockElement(30) },
      { id: 'v2', element: createMockElement(70) },
      { id: 'v3', element: createMockElement(20) },
      { id: 'v4', element: createMockElement(60) },
    ];

    const result = await paginate(items, { usableHeightPerPage: 100, unit: 'mm' });

    expect(result.overflowItems).toEqual([]);
    expect(result.pages).toEqual([
      ['v1', 'v2'], // 30 + 70 = 100mm
      ['v3', 'v4'], // 20 + 60 = 80mm
    ]);

    // Verify greedy grouping total heights
    const page1Total = 30 + 70;
    const page2Total = 20 + 60;
    expect(page1Total).toBeLessThanOrEqual(100);
    expect(page2Total).toBeLessThanOrEqual(100);
  });

  test('Test Case 4: Hidden measurement container cleanup — no leftover DOM nodes', async () => {
    const initialCount = document.body.children.length;

    const singleEl = createMockElement(25);
    const measured = measureHeight(singleEl, { fontSize: '14px' }, 'mm');
    expect(measured).toBeCloseTo(25, 2);
    expect(document.body.children.length).toBe(initialCount);

    const items = [
      { id: 'c1', element: createMockElement(30) },
      { id: 'c2', element: createMockElement(40) },
      { id: 'c3', element: createMockElement(50) },
    ];

    await paginate(items, { usableHeightPerPage: 100, unit: 'mm' });
    expect(document.body.children.length).toBe(initialCount);
  });

  test('Test Case 5: Non-blocking async execution for 50 mock items with progress callback', async () => {
    const items = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i + 1}`,
      element: createMockElement(15),
    }));

    const progressSpy = vi.fn();

    const paginatePromise = paginate(items, {
      usableHeightPerPage: 100,
      unit: 'mm',
      chunkSize: 10,
      onProgress: progressSpy,
    });

    // Expect paginate to return a Promise
    expect(paginatePromise).toBeInstanceOf(Promise);

    const result = await paginatePromise;

    expect(result.overflowItems).toEqual([]);
    // 50 items * 15mm = 750mm. Each page holds 6 items (6 * 15 = 90mm <= 100mm). 50 / 6 = 8 pages of 6 + 1 page of 2 = 9 pages.
    expect(result.pages.length).toBe(9);
    expect(progressSpy).toHaveBeenCalled();
    expect(progressSpy).toHaveBeenLastCalledWith({ processed: 50, total: 50 });
  });
});
