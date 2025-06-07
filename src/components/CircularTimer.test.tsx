import React from 'react';
import { render, screen } from '@testing-library/react';
import CircularTimer from './CircularTimer';

describe('CircularTimer', () => {
  it('should render with default size', () => {
    render(
      <CircularTimer progress={0.5} currentSeconds={15} totalSeconds={30} />
    );

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '300');
    expect(svg).toHaveAttribute('height', '300');
  });

  it('should render with custom size', () => {
    render(
      <CircularTimer progress={0.5} currentSeconds={15} totalSeconds={30} />
    );

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
  });

  it('should display correct time format', () => {
    render(
      <CircularTimer progress={0.75} currentSeconds={22.5} totalSeconds={30} />
    );

    const timeText = screen.getByText('23 / 30 secs');
    expect(timeText).toBeInTheDocument();
  });

  it('should display 0 for zero progress', () => {
    render(<CircularTimer progress={0} currentSeconds={0} totalSeconds={30} />);

    const timeText = screen.getByText('0 / 30 secs');
    expect(timeText).toBeInTheDocument();
  });

  it('should display full time for complete progress', () => {
    render(
      <CircularTimer progress={1} currentSeconds={30} totalSeconds={30} />
    );

    const timeText = screen.getByText('30 / 30 secs');
    expect(timeText).toBeInTheDocument();
  });

  it('should round current seconds correctly', () => {
    render(
      <CircularTimer
        progress={0.666}
        currentSeconds={19.98}
        totalSeconds={30}
      />
    );

    const timeText = screen.getByText('20 / 30 secs');
    expect(timeText).toBeInTheDocument();
  });

  it('should have responsive styles', () => {
    render(
      <CircularTimer progress={0.5} currentSeconds={15} totalSeconds={30} />
    );

    const svg = document.querySelector('svg');
    expect(svg).toHaveStyle({
      maxWidth: '100%',
      maxHeight: '100%',
      width: '100%',
      height: 'auto',
    });
  });

  it('should render background and progress circles', () => {
    render(
      <CircularTimer progress={0.5} currentSeconds={15} totalSeconds={30} />
    );

    const svg = document.querySelector('svg');
    const circles = svg!.querySelectorAll('circle');

    // Should have 2 circles: background and progress
    expect(circles).toHaveLength(2);

    // Background circle should have gray stroke
    expect(circles[0]).toHaveAttribute('stroke', '#e9ecef');

    // Progress circle should have blue stroke
    expect(circles[1]).toHaveAttribute('stroke', '#007bff');
  });

  it('should apply correct transform to progress circle', () => {
    render(
      <CircularTimer progress={0.5} currentSeconds={15} totalSeconds={30} />
    );

    const svg = document.querySelector('svg');
    const progressCircle = svg!.querySelectorAll('circle')[1];

    expect(progressCircle).toHaveAttribute('transform', 'rotate(-90 150 150)');
  });
});
