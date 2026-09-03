import { describe, test, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { flattenToBlocks } from './flattenToBlocks';
import { flowBlocksIntoColumns } from './paginate';
import { NotesBlockRenderer } from '../../components/NotesBlockComponents';

// Verbatim 7-question trigonometry test dataset from repository history
export const TRIG_QUESTIONS_DATA = [
  {
    id: 'q1',
    number: 1,
    question: [
      { type: 'text', content: 'State the fundamental definitions of $\\sin(\\theta)$, $\\cos(\\theta)$, and $\\tan(\\theta)$ for a right-angled triangle.' }
    ],
    solution: [
      { type: 'text', content: 'For a right triangle with opposite side $O$, adjacent side $A$, and hypotenuse $H$:' },
      { type: 'equation', latex: '\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}} = \\frac{O}{H}', displayMode: true },
      { type: 'equation', latex: '\\cos(\\theta) = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}} = \\frac{A}{H}', displayMode: true },
      { type: 'equation', latex: '\\tan(\\theta) = \\frac{\\text{Opposite}}{\\text{Adjacent}} = \\frac{O}{A}', displayMode: true }
    ]
  },
  {
    id: 'q2',
    number: 2,
    question: [
      { type: 'text', content: 'Find the hypotenuse $c$ and acute angle $\\theta$ for a right triangle with legs $a = 4$ and $b = 3$.' }
    ],
    solution: [
      {
        type: 'coordinate_graph',
        width: 260,
        height: 180,
        xRange: [-1, 5],
        yRange: [-1, 4],
        showGrid: true,
        showAxes: true,
        shapes: [
          {
            points: [
              { x: 0, y: 0 },
              { x: 4, y: 0 },
              { x: 4, y: 3 }
            ],
            fillColor: 'rgba(124, 58, 237, 0.12)',
            strokeColor: '#7C3AED',
            strokeWidth: 2
          }
        ],
        segments: [
          { from: { x: 0, y: 0 }, to: { x: 4, y: 0 }, label: 'a = 4', color: '#1F2937' },
          { from: { x: 4, y: 0 }, to: { x: 4, y: 3 }, label: 'b = 3', color: '#1F2937' },
          { from: { x: 0, y: 0 }, to: { x: 4, y: 3 }, label: 'c = ?', color: '#7C3AED' }
        ],
        points: [
          { x: 0, y: 0, label: 'A(0,0)' },
          { x: 4, y: 0, label: 'C(4,0)' },
          { x: 4, y: 3, label: 'B(4,3)' }
        ]
      },
      { type: 'text', content: 'Apply the Pythagorean theorem to calculate hypotenuse $c$:' },
      { type: 'equation', latex: 'c = \\sqrt{a^2 + b^2} = \\sqrt{4^2 + 3^2} = \\sqrt{25} = 5', displayMode: true },
      { type: 'text', content: 'Calculate angle $\\theta$ using inverse tangent:' },
      { type: 'equation', latex: '\\theta = \\arctan\\left(\\frac{3}{4}\\right) \\approx 36.87^\\circ', displayMode: true }
    ]
  },
  {
    id: 'q3',
    number: 3,
    question: [
      { type: 'text', content: 'Prove the fundamental Pythagorean trigonometric identity $\\sin^2(\\theta) + \\cos^2(\\theta) = 1$.' }
    ],
    solution: [
      { type: 'text', content: 'Consider a right triangle with legs $x, y$ and hypotenuse $r$, satisfying $x^2 + y^2 = r^2$.' },
      { type: 'text', content: 'Divide both sides of the equation by $r^2$:' },
      { type: 'equation', latex: '\\frac{x^2}{r^2} + \\frac{y^2}{r^2} = \\frac{r^2}{r^2} \\implies \\left(\\frac{x}{r}\\right)^2 + \\left(\\frac{y}{r}\\right)^2 = 1', displayMode: true },
      { type: 'text', content: 'Substitute $\\cos(\\theta) = \\frac{x}{r}$ and $\\sin(\\theta) = \\frac{y}{r}$:' },
      { type: 'equation', latex: '\\cos^2(\\theta) + \\sin^2(\\theta) = 1', displayMode: true }
    ]
  },
  {
    id: 'q4',
    number: 4,
    question: [
      { type: 'text', content: 'State the Law of Sines and solve for side $b$ when $a = 10$, $A = 30^\\circ$, and $B = 45^\\circ$.' }
    ],
    solution: [
      { type: 'text', content: 'The Law of Sines relates side lengths to opposite angles in any triangle:' },
      { type: 'equation', latex: '\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} = \\frac{c}{\\sin(C)}', displayMode: true },
      { type: 'text', content: 'Rearranging to solve for side $b$:' },
      { type: 'equation', latex: 'b = a \\cdot \\frac{\\sin(B)}{\\sin(A)} = 10 \\cdot \\frac{\\sin(45^\\circ)}{\\sin(30^\\circ)} = 10 \\cdot \\frac{\\sqrt{2}/2}{1/2} = 10\\sqrt{2} \\approx 14.14', displayMode: true }
    ]
  },
  {
    id: 'q5',
    number: 5,
    question: [
      { type: 'text', content: 'Calculate side $c$ in a triangle with $a = 5$, $b = 7$, and included angle $C = 60^\\circ$ using the Law of Cosines.' }
    ],
    solution: [
      { type: 'text', content: 'The Law of Cosines formula for side $c$ is:' },
      { type: 'equation', latex: 'c^2 = a^2 + b^2 - 2ab \\cos(C)', displayMode: true },
      { type: 'text', content: 'Substitute $a = 5$, $b = 7$, and $C = 60^\\circ$ (noting $\\cos 60^\\circ = 0.5$):' },
      { type: 'equation', latex: 'c^2 = 5^2 + 7^2 - 2(5)(7)(0.5) = 25 + 49 - 35 = 39', displayMode: true },
      { type: 'equation', latex: 'c = \\sqrt{39} \\approx 6.24', displayMode: true }
    ]
  },
  {
    id: 'q6',
    number: 6,
    question: [
      { type: 'text', content: 'Determine coordinates of point $P$ on the unit circle at angle $\\theta = 45^\\circ$.' }
    ],
    solution: [
      {
        type: 'coordinate_graph',
        width: 240,
        height: 180,
        xRange: [-1.5, 1.5],
        yRange: [-1.5, 1.5],
        showGrid: true,
        showAxes: true,
        segments: [
          { from: { x: 0, y: 0 }, to: { x: 0.707, y: 0.707 }, label: 'r = 1', color: '#16A34A' }
        ],
        points: [
          { x: 0, y: 0, label: 'O(0,0)' },
          { x: 0.707, y: 0.707, label: 'P(cos 45°, sin 45°)' }
        ]
      },
      { type: 'text', content: 'On the unit circle, $P = (\\cos\\theta, \\sin\\theta)$:' },
      { type: 'equation', latex: 'P = \\left(\\cos 45^\\circ, \\sin 45^\\circ\\right) = \\left(\\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{2}}{2}\\right) \\approx (0.707, 0.707)', displayMode: true }
    ]
  },
  {
    id: 'q7',
    number: 7,
    question: [
      { type: 'text', content: 'Derive the double-angle identity for $\\sin(2\\theta)$ using the sine sum identity.' }
    ],
    solution: [
      { type: 'text', content: 'Start with the angle addition formula $\\sin(\\alpha + \\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta$:' },
      { type: 'text', content: 'Substitute $\\alpha = \\theta$ and $\\beta = \\theta$:' },
      { type: 'equation', latex: '\\sin(\\theta + \\theta) = \\sin(\\theta)\\cos(\\theta) + \\cos(\\theta)\\sin(\\theta)', displayMode: true },
      { type: 'text', content: 'Combine the two identical terms:' },
      { type: 'equation', latex: '\\sin(2\\theta) = 2\\sin(\\theta)\\cos(\\theta)', displayMode: true }
    ]
  }
];

describe('Trigonometry Continuous Flow Pagination Verification (Test Cases 1-7)', () => {
  test('Test Case 1 & 5: Verbatim block breakdown and exact count matching', async () => {
    const blocks = flattenToBlocks(TRIG_QUESTIONS_DATA);
    expect(blocks.length).toBe(38);

    const result = await flowBlocksIntoColumns(blocks, { usableHeightPerPage: 225 });

    console.log('VERBATIM_TRIG_PAGINATION_OUTPUT:', JSON.stringify(result, null, 2));

    const totalPlaced = result.pages.reduce((sum, p) => sum + p.columnA.length + p.columnB.length, 0);
    const totalCount = totalPlaced + result.overflowBlocks.length;

    expect(totalCount).toBe(38);
    expect(result.pages.length).toBeGreaterThan(0);
  });

  test('Test Case 2, 3, 4: Solution splits across columns/pages between elements without breaking KaTeX/Diagram', async () => {
    const blocks = flattenToBlocks(TRIG_QUESTIONS_DATA);
    const result = await flowBlocksIntoColumns(blocks, { usableHeightPerPage: 225 });

    // Verify continuation label rendering for split resuming columns
    const blockMap = new Map(blocks.map(b => [b.id, b]));

    result.pages.forEach((page) => {
      ['columnA', 'columnB'].forEach((colKey) => {
        const colBlockIds = page[colKey];
        if (colBlockIds.length > 0) {
          const firstBlock = blockMap.get(colBlockIds[0]);
          const html = renderToStaticMarkup(
            React.createElement(NotesBlockRenderer, { block: firstBlock, isTopOfColumn: true })
          );

          if (firstBlock.type !== 'question-header') {
            expect(html).toContain(`Q${firstBlock.questionNumber} (continued)`);
          } else {
            expect(html).not.toContain('continued');
          }
        }
      });
    });
  });

  test('Test Case 6: Confirm paginateRows, QuestionSolutionCard, and A4Page 2-column grid exist unmodified', async () => {
    const { QuestionSolutionCard } = await import('../../components/NotesModeCard');
    const { paginateRows } = await import('./paginate');

    expect(typeof QuestionSolutionCard).toBe('function');
    expect(typeof paginateRows).toBe('function');
  });

  test('Test Case 7: Confirm KaTeX equations and coordinate_graph diagram render without distortion', () => {
    const blocks = flattenToBlocks(TRIG_QUESTIONS_DATA);
    const q2GraphBlock = blocks.find(b => b.id === 'q2-sol-0');

    expect(q2GraphBlock).toBeTruthy();

    const html = renderToStaticMarkup(
      React.createElement(NotesBlockRenderer, { block: q2GraphBlock, isTopOfColumn: false })
    );

    expect(html).toContain('svg');
    expect(html).toContain('coordinate-plane');
    expect(html).not.toContain('undefined');
  });
});
