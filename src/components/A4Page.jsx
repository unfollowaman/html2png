import React from 'react';
import { renderEquation } from '../lib/notesMode/renderEquation';
import { CoordinatePlane, Point, LineSegment, Shape } from '../lib/notesMode/diagrams';

function renderContentItem(item, idx) {
  if (typeof item === 'string') {
    return <span key={idx}>{item}</span>;
  }
  if (!item || typeof item !== 'object') {
    return <span key={idx}>{String(item)}</span>;
  }

  if (item.type === 'text') {
    return <span key={idx}>{item.content ?? item.text ?? ''}</span>;
  }

  if (item.type === 'equation') {
    const result = renderEquation(item.latex, { displayMode: item.displayMode ?? false });
    if (result.error) {
      return (
        <span key={idx} style={{ color: '#DC2626', fontWeight: 600 }}>
          [equation error: {result.message}]
        </span>
      );
    }
    return <span key={idx} dangerouslySetInnerHTML={{ __html: result.html }} />;
  }

  if (item.type === 'coordinate_graph') {
    const planeProps = {};
    if (item.xRange !== undefined) planeProps.xRange = item.xRange;
    if (item.yRange !== undefined) planeProps.yRange = item.yRange;
    if (item.showGrid !== undefined) planeProps.showGrid = item.showGrid;
    if (item.showAxes !== undefined) planeProps.showAxes = item.showAxes;
    if (item.width !== undefined) planeProps.width = item.width;
    if (item.height !== undefined) planeProps.height = item.height;
    if (item.padding !== undefined) planeProps.padding = item.padding;
    if (item.gridColor !== undefined) planeProps.gridColor = item.gridColor;
    if (item.axisColor !== undefined) planeProps.axisColor = item.axisColor;
    if (item.textColor !== undefined) planeProps.textColor = item.textColor;

    const points = Array.isArray(item.points) ? item.points : [];
    const segments = Array.isArray(item.segments) ? item.segments : [];
    const shapes = Array.isArray(item.shapes) ? item.shapes : [];

    return (
      <div key={idx} style={{ margin: '12px 0', display: 'flex', justifyContent: 'center' }}>
        <CoordinatePlane {...planeProps}>
          {shapes.map((shp, sIdx) => {
            const shpProps = { points: shp.points };
            if (shp.label !== undefined) shpProps.label = shp.label;
            if (shp.fillColor !== undefined) shpProps.fillColor = shp.fillColor;
            if (shp.strokeColor !== undefined) shpProps.strokeColor = shp.strokeColor;
            if (shp.strokeWidth !== undefined) shpProps.strokeWidth = shp.strokeWidth;
            if (shp.opacity !== undefined) shpProps.opacity = shp.opacity;
            if (shp.strokeDasharray !== undefined) shpProps.strokeDasharray = shp.strokeDasharray;
            if (shp.fontSize !== undefined) shpProps.fontSize = shp.fontSize;
            return <Shape key={`shape-${sIdx}`} {...shpProps} />;
          })}

          {segments.map((seg, sIdx) => {
            const segProps = { from: seg.from, to: seg.to };
            if (seg.label !== undefined) segProps.label = seg.label;
            if (seg.color !== undefined) segProps.color = seg.color;
            if (seg.strokeWidth !== undefined) segProps.strokeWidth = seg.strokeWidth;
            if (seg.strokeDasharray !== undefined) segProps.strokeDasharray = seg.strokeDasharray;
            if (seg.fontSize !== undefined) segProps.fontSize = seg.fontSize;
            return <LineSegment key={`seg-${sIdx}`} {...segProps} />;
          })}

          {points.map((pt, pIdx) => {
            const ptProps = { x: pt.x, y: pt.y };
            if (pt.label !== undefined) ptProps.label = pt.label;
            if (pt.color !== undefined) ptProps.color = pt.color;
            if (pt.radius !== undefined) ptProps.radius = pt.radius;
            if (pt.labelPosition !== undefined) ptProps.labelPosition = pt.labelPosition;
            if (pt.neighbors !== undefined) ptProps.neighbors = pt.neighbors;
            if (pt.fontSize !== undefined) ptProps.fontSize = pt.fontSize;
            if (pt.fontWeight !== undefined) ptProps.fontWeight = pt.fontWeight;
            return <Point key={`pt-${pIdx}`} {...ptProps} />;
          })}
        </CoordinatePlane>
      </div>
    );
  }

  // Fallback for unrecognized types or plain text objects without type
  const text = item.content ?? item.text ?? JSON.stringify(item);
  return <span key={idx}>{text}</span>;
}

function renderContentArray(contentItems) {
  if (!contentItems) return null;
  if (typeof contentItems === 'string') {
    return contentItems;
  }
  if (!Array.isArray(contentItems)) {
    return String(contentItems);
  }
  return contentItems.map((item, idx) => renderContentItem(item, idx));
}

export function A4Page({ data }) {
  if (!data) return null;

  const chapterTitle = data.chapter?.title || '';
  const chapterSubtitle = data.chapter?.subtitle || '';
  const items = data.items || data.pages?.[0]?.items || [];
  const isOverflow = Boolean(data.isOverflow);

  return (
    <div
      style={{
        width: '210mm',
        height: '297mm',
        boxSizing: 'border-box',
        padding: '18mm',
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Montserrat', sans-serif",
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        margin: '0 auto',
      }}
    >
      {/* ── HEADER REGION ────────────────────────── */}
      <div
        style={{
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '12px',
          marginBottom: '20px',
        }}
      >
        {chapterTitle && (
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#111827',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {chapterTitle}
          </h1>
        )}
        {chapterSubtitle && (
          <p
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: '#6B7280',
              margin: '4px 0 0 0',
            }}
          >
            {chapterSubtitle}
          </p>
        )}
      </div>

      {/* ── OVERFLOW WARNING BANNER ────────────────────────── */}
      {isOverflow && (
        <div
          style={{
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #F59E0B',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Content too large to fit within a single page in this phase
        </div>
      )}

      {/* ── CONTENT REGION ────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {items.map((item, index) => {
          const qNumber = item.number !== undefined ? item.number : index + 1;
          return (
            <div
              key={item.id || index}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                borderLeft: '4px solid #7C3AED',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                marginBottom: '16px',
                borderTop: '1px solid #F3F4F6',
                borderRight: '1px solid #F3F4F6',
                borderBottom: '1px solid #F3F4F6',
              }}
            >
              {/* Question Row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  {qNumber}
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: '#1F2937',
                    fontWeight: 500,
                    paddingTop: '3px',
                    flex: 1,
                  }}
                >
                  {renderContentArray(item.question)}
                </div>
              </div>

              {/* Solution Card (if present) */}
              {item.solution && (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '20px',
                    borderLeft: '4px solid #16A34A',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    marginTop: '12px',
                    borderTop: '1px solid #F3F4F6',
                    borderRight: '1px solid #F3F4F6',
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#16A34A',
                      fontWeight: 600,
                      fontSize: '13px',
                      letterSpacing: '0.02em',
                      marginBottom: '8px',
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Solution</span>
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: '#374151',
                    }}
                  >
                    {renderContentArray(item.solution)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── FOOTER REGION ────────────────────────── */}
      <div style={{ height: '12mm', flexShrink: 0 }} />
    </div>
  );
}

export default A4Page;
