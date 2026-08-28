import React from 'react';
import { useCoordinateContext, LABEL_OFFSETS, resolveLabelPosition } from './CoordinateContext';

/**
 * Point Component
 * Renders a labeled point as a filled circle and text label in SVG coordinate space.
 */
export function Point({
  x,
  y,
  label,
  color = '#7C3AED',
  radius = 5,
  labelPosition,
  neighbors = [],
  fontSize = 13,
  fontWeight = 'bold'
}) {
  const { toSvgX, toSvgY } = useCoordinateContext();

  const svgX = toSvgX(x);
  const svgY = toSvgY(y);

  const resolvedPos = labelPosition || resolveLabelPosition(x, y, neighbors);
  const offset = LABEL_OFFSETS[resolvedPos] || LABEL_OFFSETS['top-right'];

  return (
    <g className="coordinate-point" data-testid="coordinate-point">
      <circle cx={svgX} cy={svgY} r={radius} fill={color} />
      {label && (
        <text
          x={svgX + offset.dx}
          y={svgY + offset.dy}
          fill={color}
          fontSize={fontSize}
          fontWeight={fontWeight}
          textAnchor={offset.textAnchor}
          dominantBaseline={offset.dominantBaseline}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/**
 * Functional wrapper for point
 */
export function point(props = {}) {
  return <Point {...props} />;
}
