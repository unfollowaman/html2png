import React from 'react';
import { QuestionSolutionCard } from './NotesModeCard';

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
            <QuestionSolutionCard
              key={item.id || index}
              item={item}
              questionNumber={qNumber}
            />
          );
        })}
      </div>

      {/* ── FOOTER REGION ────────────────────────── */}
      <div style={{ height: '12mm', flexShrink: 0 }} />
    </div>
  );
}

export default A4Page;
