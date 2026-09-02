import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import React from 'react';
import NotesModeSpike, { TRIG_QUESTIONS_DATA } from './NotesModeSpike';

describe('NotesModeSpike Prototype', () => {
  test('renders spike header and 7-question trigonometry test dataset', () => {
    render(<NotesModeSpike />);

    expect(screen.getByText(/Notes Mode SPIKE: Paged.js Prototype & Evaluation/i)).toBeTruthy();
    expect(TRIG_QUESTIONS_DATA.length).toBe(7);

    // Verify questions present
    expect(screen.getByText(/State the fundamental definitions of/i)).toBeTruthy();
    expect(screen.getByText(/Find the hypotenuse/i)).toBeTruthy();
    expect(screen.getByText(/Prove the fundamental Pythagorean/i)).toBeTruthy();
    expect(screen.getByText(/State the Law of Sines/i)).toBeTruthy();
    expect(screen.getByText(/Calculate side/i)).toBeTruthy();
    expect(screen.getByText(/Determine coordinates/i)).toBeTruthy();
    expect(screen.getByText(/Derive the double-angle identity/i)).toBeTruthy();
  });
});
