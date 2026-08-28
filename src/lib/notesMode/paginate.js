/**
 * Helper to convert DOM pixel measurements to millimeters using a 1mm DOM calibration node.
 *
 * @param {HTMLElement} container - The DOM container element.
 * @returns {number} The height of 1mm in pixels.
 */
function getPixelsPerMm(container) {
  const calib = document.createElement('div');
  calib.style.height = '1mm';
  calib.style.padding = '0';
  calib.style.margin = '0';
  calib.style.border = 'none';
  container.appendChild(calib);
  const pxPerMm = calib.getBoundingClientRect().height;
  container.removeChild(calib);

  // Fallback to standard 96 DPI conversion (96px / 25.4mm) if measurement yields 0 or NaN
  if (!pxPerMm || isNaN(pxPerMm) || pxPerMm <= 0) {
    return 96 / 25.4;
  }
  return pxPerMm;
}

/**
 * Measures the height of a given DOM element when rendered inside a hidden off-screen container.
 *
 * Note: Unit returned is 'mm' by default (or 'px' if specified via unit option).
 * Conversion from pixels to millimeters is computed dynamically via a 1mm DOM reference node
 * inside the measurement container to match exact CSS/device resolution.
 *
 * @param {HTMLElement} element - The DOM element to measure.
 * @param {Object|string} [containerCss] - Optional CSS properties (object) or style string to apply to the container.
 * @param {string} [unit='mm'] - Unit for returned height ('mm' or 'px').
 * @returns {number} Measured height in specified unit.
 */
export function measureHeight(element, containerCss = null, unit = 'mm') {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.pointerEvents = 'none';

  if (containerCss) {
    if (typeof containerCss === 'object') {
      Object.assign(container.style, containerCss);
    } else if (typeof containerCss === 'string') {
      container.style.cssText += `; ${containerCss}`;
    }
  }

  document.body.appendChild(container);

  // Measure 1mm conversion factor inside the container context
  const pxPerMm = unit === 'mm' ? getPixelsPerMm(container) : 1;

  // Append target element for measurement
  container.appendChild(element);
  const rect = element.getBoundingClientRect();
  const heightPx = rect.height;

  // Clean up DOM nodes immediately
  if (element.parentNode === container) {
    container.removeChild(element);
  }
  if (container.parentNode === document.body) {
    document.body.removeChild(container);
  }

  if (unit === 'mm') {
    return heightPx / pxPerMm;
  }

  return heightPx;
}

/**
 * Schedules execution of a callback function non-blockingly using requestAnimationFrame
 * or setTimeout as fallback for Node/jsdom environments.
 *
 * @param {Function} callback
 */
function scheduleNextTick(callback) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * Paginates an array of DOM items into pages based on a usable height budget per page.
 * Processes items asynchronously in non-blocking chunks to prevent UI locking.
 *
 * @param {Array<{id: string|number, element: HTMLElement}>} items - List of items with unique id and renderable DOM element.
 * @param {Object} options - Pagination configuration options.
 * @param {number} options.usableHeightPerPage - Maximum allowable total height per page in target unit.
 * @param {string} [options.unit='mm'] - Measurement unit ('mm' or 'px'). Default is 'mm'.
 * @param {Object|string} [options.containerCss] - CSS properties or string for container layout context during measurement.
 * @param {number} [options.chunkSize=5] - Number of items to measure per non-blocking execution chunk.
 * @param {Function} [options.onProgress] - Optional callback invoked after each chunk with { processed, total }.
 * @returns {Promise<{pages: Array<Array<string|number>>, overflowItems: Array<string|number>}>}
 */
export function paginate(items = [], options = {}) {
  const {
    usableHeightPerPage,
    unit = 'mm',
    containerCss = null,
    chunkSize = 5,
    onProgress = null,
  } = options;

  if (typeof usableHeightPerPage !== 'number' || usableHeightPerPage <= 0) {
    throw new Error('paginate: usableHeightPerPage must be a positive number');
  }

  return new Promise((resolve) => {
    if (!items || items.length === 0) {
      resolve({ pages: [], overflowItems: [] });
      return;
    }

    const pages = [];
    const overflowItems = [];
    let currentPage = [];
    let currentHeight = 0;
    let index = 0;

    const processChunk = () => {
      const end = Math.min(index + chunkSize, items.length);

      for (; index < end; index++) {
        const item = items[index];
        const height = measureHeight(item.element, containerCss, unit);

        if (height > usableHeightPerPage) {
          // Item alone exceeds usable page height budget; flag as overflow
          overflowItems.push(item.id);
          continue;
        }

        // Use epsilon tolerance for floating-point comparisons (e.g., 40 + 40 + 20 = 100.00000000000001)
        const EPSILON = 1e-5;
        if (currentPage.length > 0 && currentHeight + height <= usableHeightPerPage + EPSILON) {
          currentPage.push(item.id);
          currentHeight += height;
        } else {
          if (currentPage.length > 0) {
            pages.push(currentPage);
          }
          currentPage = [item.id];
          currentHeight = height;
        }
      }

      if (typeof onProgress === 'function') {
        onProgress({ processed: index, total: items.length });
      }

      if (index < items.length) {
        scheduleNextTick(processChunk);
      } else {
        if (currentPage.length > 0) {
          pages.push(currentPage);
        }
        resolve({ pages, overflowItems });
      }
    };

    scheduleNextTick(processChunk);
  });
}
