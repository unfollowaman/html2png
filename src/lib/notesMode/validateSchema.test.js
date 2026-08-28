import { describe, test, expect } from 'vitest';
import { validateNotesJson } from './validateSchema';

describe('validateNotesJson', () => {
  // Test Case 1: A fully valid Phase 1 JSON document passes with valid: true and an empty errors array.
  test('Test Case 1: A fully valid Phase 1 JSON document passes with valid: true and an empty errors array', () => {
    const validDoc = {
      chapter: {
        title: 'Chapter 1: Kinematics',
        subtitle: 'Motion in One Dimension'
      },
      pages: [
        {
          items: [
            {
              type: 'question',
              number: 1,
              question: [{ type: 'text', content: 'What is constant acceleration?' }],
              solution: [{ type: 'text', content: 'Acceleration that does not change over time.' }]
            }
          ]
        }
      ]
    };

    const result = validateNotesJson(validDoc);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  // Test Case 2: A document missing chapter.title fails with a specific error path pointing at "chapter.title".
  test('Test Case 2: A document missing chapter.title fails with a specific error path pointing at "chapter.title"', () => {
    const invalidDoc = {
      chapter: {
        subtitle: 'Motion in One Dimension'
      },
      pages: []
    };

    const result = validateNotesJson(invalidDoc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(err => err.path === 'chapter.title')).toBe(true);
  });

  // Test Case 3: A document where items[0] has no solution array fails with an error path pointing at the specific item index.
  test('Test Case 3: A document where items[0] has no solution array fails with an error path pointing at the specific item index', () => {
    const invalidDoc = {
      chapter: {
        title: 'Chapter 1: Kinematics',
        subtitle: 'Motion in One Dimension'
      },
      pages: [
        {
          items: [
            {
              type: 'question',
              number: 1,
              question: [{ type: 'text', content: 'What is velocity?' }]
            }
          ]
        }
      ]
    };

    const result = validateNotesJson(invalidDoc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(err => err.path === 'pages[0].items[0].solution')).toBe(true);
  });

  // Test Case 4: A document where an item has an unrecognized type (e.g. "foobar") is flagged rather than silently accepted or silently rendered as blank.
  test('Test Case 4: A document where an item has an unrecognized type (e.g. "foobar") is flagged', () => {
    const invalidDoc = {
      chapter: {
        title: 'Chapter 1: Kinematics',
        subtitle: 'Motion in One Dimension'
      },
      pages: [
        {
          items: [
            {
              type: 'foobar',
              number: 1
            }
          ]
        }
      ]
    };

    const result = validateNotesJson(invalidDoc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(err => err.path === 'pages[0].items[0].type')).toBe(true);
  });

  // Test Case 5: An empty pages array is accepted as structurally valid (zero pages is not itself an error).
  test('Test Case 5: An empty pages array is accepted as structurally valid', () => {
    const validDocWithEmptyPages = {
      chapter: {
        title: 'Chapter 1: Kinematics',
        subtitle: 'Motion in One Dimension'
      },
      pages: []
    };

    const result = validateNotesJson(validDocWithEmptyPages);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
