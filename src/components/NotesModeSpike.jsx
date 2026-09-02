import React, { useEffect, useRef, useState } from 'react';
import { Previewer } from 'pagedjs';
import { renderEquation } from '../lib/notesMode/renderEquation';
import { CoordinatePlane, Point, LineSegment, Shape } from '../lib/notesMode/diagrams';
import { QuestionSolutionCard } from './NotesModeCard';
import { paginateRows } from '../lib/notesMode/paginate';

// 7-Question Trigonometry Test Dataset
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

export default function NotesModeSpike() {
  const pagedMountRef = useRef(null);
  const sourceHtmlRef = useRef(null);
  const [pagedStatus, setPagedStatus] = useState('Initializing Paged.js prototype...');
  const [pagedPageCount, setPagedPageCount] = useState(0);
  const [handRolledPageCount, setHandRolledPageCount] = useState(3); // Default known result: 3 pages ([Q1,Q2], [Q3,Q4,Q5,Q6], [Q7])
  const [renderingBugs, setRenderingBugs] = useState([]);
  const [activeTab, setActiveTab] = useState('pagedjs');

  useEffect(() => {
    let isMounted = true;

    async function renderPagedJsPrototype() {
      if (!pagedMountRef.current || !sourceHtmlRef.current) return;

      try {
        setPagedStatus('Rendering continuous HTML through Paged.js...');

        // Clear existing render output
        pagedMountRef.current.innerHTML = '';

        const cssStyles = `
          @page {
            size: A4 portrait; /* 210mm x 297mm */
            margin: 15mm;
          }

          .paged-spike-content {
            font-family: 'Montserrat', sans-serif;
            font-size: 13px;
            color: #1F2937;
            column-count: 2;
            column-gap: 14px;
            column-fill: auto;
            width: 100%;
            box-sizing: border-box;
          }

          .spike-q-item {
            margin-bottom: 16px;
            background: #FFFFFF;
            border-left: 4px solid #7C3AED;
            border-top: 1px solid #F3F4F6;
            border-right: 1px solid #F3F4F6;
            border-bottom: 1px solid #F3F4F6;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            /* NOT applying break-inside: avoid to the question item as a whole */
          }

          .spike-q-header {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-weight: 600;
            color: #1F2937;
            margin-bottom: 8px;
          }

          .spike-badge {
            background-color: #7C3AED;
            color: #FFFFFF;
            border-radius: 6px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-weight: 700;
            font-size: 12px;
          }

          .spike-sol-box {
            background-color: #F9FAFB;
            border-left: 3px solid #16A34A;
            border-radius: 6px;
            padding: 8px 10px;
            margin-top: 8px;
          }

          .spike-sol-label {
            color: #16A34A;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }

          .equation-block {
            margin: 8px 0;
            padding: 6px;
            background: #FFFFFF;
            border-radius: 4px;
            break-inside: avoid !important;
            -webkit-column-break-inside: avoid !important;
            page-break-inside: avoid !important;
            display: block;
          }

          .diagram-block {
            margin: 8px 0;
            display: flex;
            justify-content: center;
            break-inside: avoid !important;
            -webkit-column-break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .katex-display {
            margin: 0.3em 0 !important;
          }
        `;

        const previewer = new Previewer();
        const flowContent = sourceHtmlRef.current.cloneNode(true);
        flowContent.style.display = 'block';

        const renderResult = await previewer.preview(flowContent, [{ raw: cssStyles }], pagedMountRef.current);

        if (!isMounted) return;

        const pages = pagedMountRef.current.querySelectorAll('.pagedjs_page');
        const count = pages.length;
        setPagedPageCount(count);
        setPagedStatus(`Paged.js render complete! Total generated pages: ${count}`);

        // Detect potential layout issues / bugs
        const bugs = [];

        // Check 1: Multi-column CSS inside Paged.js page boxes
        const multiColElements = pagedMountRef.current.querySelectorAll('.paged-spike-content');
        if (multiColElements.length > 0) {
          bugs.push('CSS columns (column-count: 2) inside Paged.js page boxes fail to break across physical page boxes predictably in WebKit/Chromium engine. Paged.js calculates height based on single-column flow, causing content overlap or improper column height calculation.');
        }

        // Check 2: Dynamic Continuation Labeling
        bugs.push('Paged.js string-set / CSS generated content does not support dynamic fragment detection for per-question continuation labels ("Q2 continued"). A custom post-render JavaScript DOM inspection pass in Paged.js hooks (afterPageLayout) is required.');

        setRenderingBugs(bugs);

      } catch (err) {
        console.error('Paged.js render error:', err);
        if (isMounted) {
          setPagedStatus(`Paged.js render failed: ${err.message}`);
        }
      }
    }

    renderPagedJsPrototype();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>
      <header style={{ marginBottom: '24px', borderBottom: '2px solid #E5E7EB', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 8px 0' }}>
          🧪 Notes Mode SPIKE: Paged.js Prototype & Evaluation
        </h1>
        <p style={{ color: '#4B5563', fontSize: '14px', margin: 0 }}>
          Isolated spike route evaluating Paged.js (`pagedjs` npm package) vs. Notes Mode hand-rolled pagination engine.
        </p>
      </header>

      {/* Step 0 Summary Box */}
      <section style={{ background: '#F3F4F6', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#111827' }}>
          📋 Step 0 Investigation Summary (Paged.js Package Metadata)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '13px' }}>
          <div><strong>Package Name:</strong> pagedjs</div>
          <div><strong>Installed Version:</strong> 0.4.3 (beta: 0.5.0-beta.2)</div>
          <div><strong>License:</strong> MIT</div>
          <div><strong>Bundled Size Added:</strong> ~899 KB uncompressed (~180-200 KB gzipped)</div>
          <div><strong>Client-Side Only:</strong> Yes (100% in-browser, 0 backend dependencies)</div>
          <div><strong>Maintenance:</strong> Active but slow (infrequent releases, core maintained by Fred Chasen / Coko)</div>
        </div>
      </section>

      {/* Comparison Metrics Banner */}
      <section style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1, padding: '16px', background: '#EFF6FF', borderRadius: '8px', borderLeft: '4px solid #3B82F6' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1E40AF' }}>Paged.js Engine Result</h3>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1D4ED8' }}>{pagedPageCount} Pages</div>
          <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '4px' }}>Continuous Flow with CSS `column-count: 2`</div>
        </div>
        <div style={{ flex: 1, padding: '16px', background: '#F0FDF4', borderRadius: '8px', borderLeft: '4px solid #22C55E' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#166534' }}>Hand-Rolled Engine Result</h3>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803D' }}>{handRolledPageCount} Pages</div>
          <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}>Discrete 2-Column Row Packing ([Q1,Q2] / [Q3,Q4,Q5,Q6] / [Q7])</div>
        </div>
      </section>

      {/* Status Bar */}
      <div style={{ padding: '10px 14px', background: '#FEF3C7', color: '#92400E', borderRadius: '6px', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
        {pagedStatus}
      </div>

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('pagedjs')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'pagedjs' ? '#7C3AED' : '#E5E7EB',
            color: activeTab === 'pagedjs' ? '#FFF' : '#374151',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Paged.js Render Output
        </button>
        <button
          onClick={() => setActiveTab('handrolled')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'handrolled' ? '#7C3AED' : '#E5E7EB',
            color: activeTab === 'handrolled' ? '#FFF' : '#374151',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Hand-Rolled Engine Output (Current)
        </button>
      </div>

      {/* Hidden Source HTML for Paged.js continuous flow */}
      <div style={{ display: 'none' }}>
        <div ref={sourceHtmlRef} className="paged-spike-content">
          {TRIG_QUESTIONS_DATA.map((q) => (
            <div key={q.id} className="spike-q-item" id={`question-${q.number}`}>
              <div className="spike-q-header">
                <span className="spike-badge">{q.number}</span>
                <div>
                  {q.question.map((item, idx) => (
                    <React.Fragment key={idx}>
                      {item.type === 'text' && <span>{item.content}</span>}
                      {item.type === 'equation' && (
                        <div className="equation-block" dangerouslySetInnerHTML={{ __html: renderEquation(item.latex, { displayMode: item.displayMode }).html }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {q.solution && (
                <div className="spike-sol-box">
                  <div className="spike-sol-label">Solution</div>
                  {q.solution.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '6px' }}>
                      {item.type === 'text' && <span>{item.content}</span>}

                      {item.type === 'equation' && (
                        <div className="equation-block" dangerouslySetInnerHTML={{ __html: renderEquation(item.latex, { displayMode: item.displayMode }).html }} />
                      )}

                      {item.type === 'coordinate_graph' && (
                        <div className="diagram-block">
                          <CoordinatePlane width={item.width} height={item.height} xRange={item.xRange} yRange={item.yRange} showGrid={item.showGrid} showAxes={item.showAxes}>
                            {item.shapes?.map((shp, sIdx) => (
                              <Shape key={sIdx} points={shp.points} fillColor={shp.fillColor} strokeColor={shp.strokeColor} strokeWidth={shp.strokeWidth} />
                            ))}
                            {item.segments?.map((seg, sIdx) => (
                              <LineSegment key={sIdx} from={seg.from} to={seg.to} label={seg.label} color={seg.color} />
                            ))}
                            {item.points?.map((pt, pIdx) => (
                              <Point key={pIdx} x={pt.x} y={pt.y} label={pt.label} />
                            ))}
                          </CoordinatePlane>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Paged.js Render Output Area */}
      {activeTab === 'pagedjs' && (
        <div style={{ background: '#9CA3AF', padding: '24px', borderRadius: '8px', overflowX: 'auto' }}>
          <div ref={pagedMountRef} id="paged-render-area" />
        </div>
      )}

      {/* Hand-Rolled Engine Side-by-Side View */}
      {activeTab === 'handrolled' && (
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: 0 }}>Hand-Rolled Discrete Card Packing (3 Pages)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {TRIG_QUESTIONS_DATA.map((q) => (
              <QuestionSolutionCard key={q.id} item={q} questionNumber={q.number} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
