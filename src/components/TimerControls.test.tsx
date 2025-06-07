import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimerControls from './TimerControls';

describe('TimerControls', () => {
  const defaultProps = {
    loopLength: 30,
    onLoopLengthChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the loop length input with correct initial value', () => {
    render(<TimerControls {...defaultProps} />);

    const input = screen.getByLabelText(/loop length/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(30);
  });

  it('should display the seconds label', () => {
    render(<TimerControls {...defaultProps} />);

    expect(screen.getByText('seconds')).toBeInTheDocument();
  });

  it('should call onLoopLengthChange when valid number is entered', () => {
    const onLoopLengthChange = jest.fn();
    render(
      <TimerControls
        {...defaultProps}
        onLoopLengthChange={onLoopLengthChange}
      />
    );

    const input = screen.getByLabelText(/loop length/i);
    fireEvent.change(input, { target: { value: '60' } });

    expect(onLoopLengthChange).toHaveBeenCalledWith(60);
  });

  it('should not call onLoopLengthChange for invalid input', () => {
    const onLoopLengthChange = jest.fn();
    render(
      <TimerControls
        {...defaultProps}
        onLoopLengthChange={onLoopLengthChange}
      />
    );

    const input = screen.getByLabelText(/loop length/i);

    // Test with negative number
    fireEvent.change(input, { target: { value: '-10' } });
    expect(onLoopLengthChange).not.toHaveBeenCalled();

    // Test with zero
    fireEvent.change(input, { target: { value: '0' } });
    expect(onLoopLengthChange).not.toHaveBeenCalled();

    // Test with non-numeric value
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(onLoopLengthChange).not.toHaveBeenCalled();
  });

  it('should have correct input constraints', () => {
    render(<TimerControls {...defaultProps} />);

    const input = screen.getByLabelText(/loop length/i) as HTMLInputElement;
    expect(input.type).toBe('number');
    expect(input.min).toBe('1');
    expect(input.max).toBe('3600');
  });

  it('should have proper accessibility attributes', () => {
    render(<TimerControls {...defaultProps} />);

    const label = screen.getByText(/loop length/i);
    const input = screen.getByLabelText(/loop length/i);

    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'loop-length-input');
    expect(label).toHaveAttribute('for', 'loop-length-input');
  });
});
