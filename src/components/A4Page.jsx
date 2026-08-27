import React from 'react';

function renderContentArray(contentItems) {
  if (!contentItems) return null;
  if (typeof contentItems === 'string') {
    return contentItems;
  }
  if (!Array.isArray(contentItems)) {
    return String(contentItems);
  }
  return contentItems.map((item, idx) => {
    if (typeof item === 'string') {
      return <span key={idx}>{item}</span>;
    }
    const text = item?.content ?? item?.text ?? (typeof item === 'object' ? JSON.stringify(item) : String(item));
    return <span key={idx}>{text}</span>;
  });
}

export function A4Page({ data }) {
  if (!data) return null;

  const chapterTitle = data.chapter?.title || '';
  const chapterSubtitle = data.chapter?.subtitle || '';
  const firstPage = data.pages?.[0] || {};
  const items = firstPage.items || [];

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

      {/* ── CONTENT REGION ────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {items.map((item, index) => {
          const qNumber = item.number !== undefined ? item.number : index + 1;
          return (
            <div
              key={index}
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
