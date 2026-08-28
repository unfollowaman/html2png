import React, { createContext, useContext } from 'react';

export const CoordinateContext = createContext(null);

export function useCoordinateContext() {
  const context = useContext(CoordinateContext);
  if (!context) {
    throw new Error('Coordinate components (Point, LineSegment, Shape) must be rendered inside a CoordinatePlane.');
  }
  return context;
}

/**
 * Creates transformation helper functions for mapping data coordinates to SVG viewBox space.
 */
export function createCoordinateTransformers({
  xRange = [-5, 5],
  yRange = [-5, 5],
  width = 400,
  height = 400,
  padding = 40
} = {}) {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const innerWidth = width - 2 * padding;
  const innerHeight = height - 2 * padding;

  const scaleX = innerWidth / (xMax - xMin);
  const scaleY = innerHeight / (yMax - yMin);

  const toSvgX = (x) => padding + (x - xMin) * scaleX;
  const toSvgY = (y) => (height - padding) - (y - yMin) * scaleY;

  return {
    xRange,
    yRange,
    width,
    height,
    padding,
    xMin,
    xMax,
    yMin,
    yMax,
    toSvgX,
    toSvgY,
    scaleX,
    scaleY
  };
}

/**
 * Label position offsets in SVG coordinates (dx, dy, textAnchor, dominantBaseline)
 */
export const LABEL_OFFSETS = {
  'top-right': { dx: 10, dy: -10, textAnchor: 'start', dominantBaseline: 'auto' },
  'top-left': { dx: -10, dy: -10, textAnchor: 'end', dominantBaseline: 'auto' },
  'bottom-right': { dx: 10, dy: 14, textAnchor: 'start', dominantBaseline: 'auto' },
  'bottom-left': { dx: -10, dy: 14, textAnchor: 'end', dominantBaseline: 'auto' },
  'top': { dx: 0, dy: -12, textAnchor: 'middle', dominantBaseline: 'auto' },
  'bottom': { dx: 0, dy: 16, textAnchor: 'middle', dominantBaseline: 'auto' },
  'left': { dx: -12, dy: 4, textAnchor: 'end', dominantBaseline: 'auto' },
  'right': { dx: 12, dy: 4, textAnchor: 'start', dominantBaseline: 'auto' }
};

/**
 * Computes an optimal label position offset for a point given neighbor coordinates
 * to avoid label collision.
 */
export function resolveLabelPosition(x, y, neighbors = [], threshold = 1.5) {
  const closeNeighbors = neighbors.filter(
    (n) => Math.hypot(n.x - x, n.y - y) <= threshold && !(n.x === x && n.y === y)
  );

  if (closeNeighbors.length === 0) {
    return 'top-right';
  }

  // Calculate net vector pointing away from close neighbors in data space
  let vecX = 0;
  let vecY = 0;
  for (const n of closeNeighbors) {
    const dx = x - n.x;
    const dy = y - n.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    vecX += dx / dist;
    vecY += dy / dist;
  }

  if (vecX === 0 && vecY === 0) {
    return 'top-right';
  }

  // Determine quadrant in data space (Y up is positive)
  if (vecX >= 0 && vecY >= 0) return 'top-right';
  if (vecX < 0 && vecY >= 0) return 'top-left';
  if (vecX < 0 && vecY < 0) return 'bottom-left';
  return 'bottom-right';
}
