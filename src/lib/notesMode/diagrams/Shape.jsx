import React from 'react';
import { useCoordinateContext } from './CoordinateContext';

/**
 * Shape Component
 * Renders an arbitrary polygon/polyline from an array of coordinate points.
 */
export function Shape({
  points = [],
  closed = true,
  fillColor = 'rgba(124, 58, 237, 0.15)',
  strokeColor = '#7C3AED',
  strokeWidth = 2,
  strokeDasharray
}) {
  const { toSvgX, toSvgY } = useCoordinateContext();

  if (!points || points.length === 0) return null;

  const pointsString = points
    .map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`)
    .join(' ');

  return (
    <g className="coordinate-shape" data-testid="coordinate-shape">
      {closed ? (
        <polygon
          points={pointsString}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      ) : (
        <polyline
          points={pointsString}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      )}
    </g>
  );
}

/**
 * Functional wrapper for shape
 */
export function shape(props = {}) {
  return <Shape {...props} />;
}
