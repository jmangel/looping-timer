import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation and monte carlo page', () => {
  render(<App />);
  const monteCarloLink = screen.getByText(/monte carlo/i);
  expect(monteCarloLink).toBeInTheDocument();

  const loopLengthLabel = screen.getByText(/loop length/i);
  expect(loopLengthLabel).toBeInTheDocument();
});
