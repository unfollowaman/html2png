import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'vitest';
import React from 'react';
import App from '../App';
import NotesConverter from './NotesConverter';

describe('NotesConverter & Notes Mode integration', () => {
  afterEach(() => {
    cleanup();
  });

  const sampleJsonOnePage = JSON.stringify({
    chapter: { title: "Chapter 1: Physics", subtitle: "Kinematics" },
    pages: [
      {
        items: [
          {
            type: "question",
            number: 1,
            question: [{ type: "text", content: "What is velocity?" }],
            solution: [{ type: "text", content: "Speed in a given direction." }]
          },
          {
            type: "question",
            number: 2,
            question: [{ type: "text", content: "What is acceleration?" }],
            solution: [{ type: "text", content: "Rate of change of velocity." }]
          }
        ]
      }
    ]
  });

  const sampleJsonTwoPages = JSON.stringify({
    chapter: { title: "Chapter 2: Multi Page", subtitle: "Testing pagination" },
    pages: [
      {
        items: [
          {
            type: "question",
            number: 1,
            question: [{ type: "text", content: "First Page Question" }],
            solution: [{ type: "text", content: "First Page Solution" }]
          }
        ]
      },
      {
        items: [
          {
            type: "question",
            number: 2,
            question: [{ type: "text", content: "Second Page Question" }],
            solution: [{ type: "text", content: "Second Page Solution" }]
          }
        ]
      }
    ]
  });

  test('Test Case 1: Paste valid JSON with 1 page containing 2 questions -> clicking Generate renders A4 page with 2 card pairs', async () => {
    render(<NotesConverter mode="notes" setMode={() => {}} />);

    const textarea = screen.getByLabelText('Input Notes JSON');
    fireEvent.change(textarea, { target: { value: sampleJsonOnePage } });

    const generateBtn = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(generateBtn);

    expect(await screen.findByText('Chapter 1: Physics')).toBeTruthy();
    expect(screen.getByText('Kinematics')).toBeTruthy();
    expect(screen.getByText('What is velocity?')).toBeTruthy();
    expect(screen.getByText('Speed in a given direction.')).toBeTruthy();
    expect(screen.getByText('What is acceleration?')).toBeTruthy();
    expect(screen.getByText('Rate of change of velocity.')).toBeTruthy();
  });

  test('Test Case 2: Paste JSON with 2 page entries -> Generate renders only first page content', async () => {
    render(<NotesConverter mode="notes" setMode={() => {}} />);

    const textarea = screen.getByLabelText('Input Notes JSON');
    fireEvent.change(textarea, { target: { value: sampleJsonTwoPages } });

    const generateBtn = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(generateBtn);

    expect(await screen.findByText('Chapter 2: Multi Page')).toBeTruthy();
    expect(screen.getByText('First Page Question')).toBeTruthy();
    expect(screen.queryByText('Second Page Question')).toBeNull();
  });

  test('Test Case 3: Paste invalid JSON -> Validate shows clear inline error message', () => {
    render(<NotesConverter mode="notes" setMode={() => {}} />);

    const textarea = screen.getByLabelText('Input Notes JSON');
    fireEvent.change(textarea, { target: { value: '{"chapter": "bad json",}' } });

    const validateBtn = screen.getByRole('button', { name: /Validate/i });
    fireEvent.click(validateBtn);

    expect(screen.getByText(/Expected/i)).toBeTruthy();
  });

  test('Test Case 4: Load JSON file from disk -> populates textarea', async () => {
    render(<NotesConverter mode="notes" setMode={() => {}} />);

    const file = new File(['{"chapter": {"title": "File Loaded"}}'], 'test.json', { type: 'application/json' });
    const fileInput = document.querySelector('input[type="file"][accept*=".json"]');

    fireEvent.change(fileInput, { target: { files: [file] } });

    const textarea = screen.getByLabelText('Input Notes JSON');
    await waitFor(() => {
      expect(textarea.value).toBe('{"chapter": {"title": "File Loaded"}}');
    });
  });

  test('Test Case 5: Click Clear after generating a page -> textarea empties and A4 preview clears', async () => {
    render(<NotesConverter mode="notes" setMode={() => {}} />);

    const textarea = screen.getByLabelText('Input Notes JSON');
    fireEvent.change(textarea, { target: { value: sampleJsonOnePage } });

    const generateBtn = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(generateBtn);

    expect(await screen.findByText('Chapter 1: Physics')).toBeTruthy();

    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearBtn);

    expect(textarea.value).toBe('');
    expect(screen.queryByText('Chapter 1: Physics')).toBeNull();
  });

  test('Test Case 6: Switch between modes in App -> no crash or state leakage', async () => {
    render(<App />);

    // Wait for initial lazy loaded component
    expect(await screen.findByLabelText('Input HTML')).toBeTruthy();

    // Click Notes Mode button
    const notesButtons = screen.getAllByRole('button', { name: 'Notes Mode' });
    fireEvent.click(notesButtons[0]);

    // Verify Notes Mode rendered
    expect(await screen.findByLabelText('Input Notes JSON')).toBeTruthy();

    // Switch back to HTML Mode
    const htmlButtons = screen.getAllByRole('button', { name: 'HTML Mode' });
    fireEvent.click(htmlButtons[0]);

    expect(await screen.findByLabelText('Input HTML')).toBeTruthy();
  });
});
