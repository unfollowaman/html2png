import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import DefaultA4Page, { A4Page } from './A4Page';

describe('A4Page Component', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders null when no data prop is provided', () => {
    const { container } = render(<A4Page />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null when data prop is null', () => {
    const { container } = render(<A4Page data={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders page container when data is an empty object', () => {
    const { container } = render(<A4Page data={{}} />);
    expect(container.firstChild).not.toBeNull();
    expect(screen.queryByText('Content too large to fit within a single page in this phase')).toBeNull();
  });

  it('renders chapter title and subtitle when provided', () => {
    const data = {
      chapter: {
        title: 'Chapter 1: Motion in a Straight Line',
        subtitle: 'Physics Class 11',
      },
    };

    render(<A4Page data={data} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Chapter 1: Motion in a Straight Line');
    expect(screen.getByText('Physics Class 11')).toBeTruthy();
  });

  it('omits chapter elements when chapter info is missing or empty', () => {
    const data = {
      chapter: {
        title: '',
        subtitle: '',
      },
    };

    render(<A4Page data={data} />);

    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.queryByText('Physics Class 11')).toBeNull();
  });

  it('renders overflow banner when isOverflow is true', () => {
    const data = {
      isOverflow: true,
    };

    render(<A4Page data={data} />);

    expect(
      screen.getByText('Content too large to fit within a single page in this phase')
    ).toBeTruthy();
  });

  it('does not render overflow banner when isOverflow is false or undefined', () => {
    const data = {
      isOverflow: false,
    };

    render(<A4Page data={data} />);

    expect(
      screen.queryByText('Content too large to fit within a single page in this phase')
    ).toBeNull();
  });

  it('renders items passed via data.items with auto-incremented question numbers', () => {
    const data = {
      items: [
        { id: 'item-1', question: 'What is speed?', solution: 'Speed is distance over time.' },
        { id: 'item-2', question: 'What is velocity?', solution: 'Velocity is displacement over time.' },
      ],
    };

    render(<A4Page data={data} />);

    expect(screen.getByText('What is speed?')).toBeTruthy();
    expect(screen.getByText('Speed is distance over time.')).toBeTruthy();
    expect(screen.getByText('What is velocity?')).toBeTruthy();
    expect(screen.getByText('Velocity is displacement over time.')).toBeTruthy();

    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('respects explicit item.number if provided', () => {
    const data = {
      items: [
        { id: 'item-1', number: 5, question: 'Question Five', solution: 'Answer Five' },
        { id: 'item-2', number: 12, question: 'Question Twelve', solution: 'Answer Twelve' },
      ],
    };

    render(<A4Page data={data} />);

    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
  });

  it('falls back to data.pages[0].items when data.items is undefined', () => {
    const data = {
      pages: [
        {
          items: [
            { id: 'item-page-1', question: 'Page 1 Question', solution: 'Page 1 Solution' },
          ],
        },
      ],
    };

    render(<A4Page data={data} />);

    expect(screen.getByText('Page 1 Question')).toBeTruthy();
    expect(screen.getByText('Page 1 Solution')).toBeTruthy();
  });

  it('supports rendering via default export', () => {
    const { container } = render(<DefaultA4Page data={{}} />);
    expect(container.firstChild).not.toBeNull();
  });
});
