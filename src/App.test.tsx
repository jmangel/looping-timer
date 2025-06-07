import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation and looping timer page', () => {
  render(<App />);
  const loopingTimerLink = screen.getByText(/looping timer/i);
  expect(loopingTimerLink).toBeInTheDocument();

  const loopLengthLabel = screen.getByText(/loop length/i);
  expect(loopLengthLabel).toBeInTheDocument();
});

test('app renders without crashing', () => {
  render(<App />);
  const loopingTimerLink = screen.getByText(/looping timer/i);
  expect(loopingTimerLink).toBeInTheDocument();
});
