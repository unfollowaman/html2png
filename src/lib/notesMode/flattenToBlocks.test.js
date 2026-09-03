import { describe, test, expect } from 'vitest';
import { flattenToBlocks } from './flattenToBlocks';

describe('flattenToBlocks', () => {
  test('flattens chapter JSON items into ordered block stream', () => {
    const chapterJson = {
      chapter: { title: 'Test Chapter', subtitle: 'Test Subtitle' },
      pages: [
        {
          items: [
            {
              id: 'q1',
              number: 1,
              question: [{ type: 'text', content: 'What is sin(x)?' }],
              solution: [
                { type: 'text', content: 'Ratio of opp / hyp.' },
                { type: 'equation', latex: '\\sin(x) = \\frac{O}{H}' }
              ]
            },
            {
              id: 'q2',
              number: 2,
              question: [{ type: 'text', content: 'What is cos(x)?' }],
              solution: [
                { type: 'text', content: 'Ratio of adj / hyp.' }
              ]
            }
          ]
        }
      ]
    };

    const blocks = flattenToBlocks(chapterJson);

    expect(blocks.length).toBe(5);

    // Q1 blocks
    expect(blocks[0]).toEqual({
      id: 'q1-header',
      type: 'question-header',
      questionNumber: 1,
      content: [{ type: 'text', content: 'What is sin(x)?' }],
      rawItem: chapterJson.pages[0].items[0]
    });

    expect(blocks[1]).toEqual({
      id: 'q1-sol-0',
      type: 'solution-first',
      questionNumber: 1,
      element: { type: 'text', content: 'Ratio of opp / hyp.' },
      rawItem: chapterJson.pages[0].items[0]
    });

    expect(blocks[2]).toEqual({
      id: 'q1-sol-1',
      type: 'solution-rest',
      questionNumber: 1,
      element: { type: 'equation', latex: '\\sin(x) = \\frac{O}{H}' },
      rawItem: chapterJson.pages[0].items[0]
    });

    // Q2 blocks
    expect(blocks[3]).toEqual({
      id: 'q2-header',
      type: 'question-header',
      questionNumber: 2,
      content: [{ type: 'text', content: 'What is cos(x)?' }],
      rawItem: chapterJson.pages[0].items[1]
    });

    expect(blocks[4]).toEqual({
      id: 'q2-sol-0',
      type: 'solution-first',
      questionNumber: 2,
      element: { type: 'text', content: 'Ratio of adj / hyp.' },
      rawItem: chapterJson.pages[0].items[1]
    });
  });
});
