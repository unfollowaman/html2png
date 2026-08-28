import React from 'react';
import { useCoordinateContext } from './CoordinateContext';

/**
 * LineSegment Component
 * Renders a line between two coordinate-space points transformed into SVG space.
 */
export function LineSegment({
  from,
  to,
  label,
  color = '#2563EB',
  strokeWidth = 2,
  strokeDasharray,
  fontSize = 12
}) {
  const { toSvgX, toSvgY } = useCoordinateContext();

  if (!from || !to) return null;

  const x1 = toSvgX(from.x);
  const y1 = toSvgY(from.y);
  const x2 = toSvgX(to.x);
  const y2 = toSvgY(to.y);

  // Label at midpoint
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g className="coordinate-line-segment" data-testid="coordinate-line-segment">
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />
      {label && (
        <text
          x={midX}
          y={midY - 8}
          fill={color}
          fontSize={fontSize}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/**
 * Functional wrapper for lineSegment
 */
export function lineSegment(props = {}) {
  return <LineSegment {...props} />;
}
