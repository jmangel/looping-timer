import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimerControls from './TimerControls';

describe('TimerControls', () => {
  const defaultProps = {
    loopLength: 30,
    onLoopLengthChange: jest.fn(),
    tickInterval: 5,
    onTickIntervalChange: jest.fn(),
    isMuted: false,
    onMuteChange: jest.fn(),
    useSpeech: false,
    onSpeechChange: jest.fn(),
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

    const secLabels = screen.getAllByText('sec');
    expect(secLabels).toHaveLength(2); // One for loop length, one for tick interval
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

  it('should render the tick interval input with correct initial value', () => {
    render(<TimerControls {...defaultProps} />);

    const input = screen.getByLabelText(/tick every/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(5);
  });

  it('should call onTickIntervalChange when valid number is entered', () => {
    const onTickIntervalChange = jest.fn();
    render(
      <TimerControls
        {...defaultProps}
        onTickIntervalChange={onTickIntervalChange}
      />
    );

    const input = screen.getByLabelText(/tick every/i);
    fireEvent.change(input, { target: { value: '10' } });

    expect(onTickIntervalChange).toHaveBeenCalledWith(10);
  });

  it('should not call onTickIntervalChange for invalid input', () => {
    const onTickIntervalChange = jest.fn();
    render(
      <TimerControls
        {...defaultProps}
        onTickIntervalChange={onTickIntervalChange}
      />
    );

    const input = screen.getByLabelText(/tick every/i);

    // Test with negative number
    fireEvent.change(input, { target: { value: '-5' } });
    expect(onTickIntervalChange).not.toHaveBeenCalled();

    // Test with zero
    fireEvent.change(input, { target: { value: '0' } });
    expect(onTickIntervalChange).not.toHaveBeenCalled();

    // Test with non-numeric value
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(onTickIntervalChange).not.toHaveBeenCalled();
  });

  it('should have correct tick interval input constraints', () => {
    render(<TimerControls {...defaultProps} />);

    const input = screen.getByLabelText(/tick every/i) as HTMLInputElement;
    expect(input.type).toBe('number');
    expect(input.min).toBe('1');
    expect(input.max).toBe('60');
  });

  it('should have proper accessibility attributes for tick interval', () => {
    render(<TimerControls {...defaultProps} />);

    const label = screen.getByText(/tick every/i);
    const input = screen.getByLabelText(/tick every/i);

    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'tick-interval-input');
    expect(label).toHaveAttribute('for', 'tick-interval-input');
  });

  it('should render mute switch with correct initial state', () => {
    render(<TimerControls {...defaultProps} />);

    const muteSwitch = screen.getByLabelText(/mute/i);
    expect(muteSwitch).toBeInTheDocument();
    expect(muteSwitch).not.toBeChecked();
  });

  it('should call onMuteChange when mute switch is toggled', () => {
    const onMuteChange = jest.fn();
    render(<TimerControls {...defaultProps} onMuteChange={onMuteChange} />);

    const muteSwitch = screen.getByLabelText(/mute/i);
    fireEvent.click(muteSwitch);

    expect(onMuteChange).toHaveBeenCalledWith(true);
  });

  it('should render speech switch with correct initial state', () => {
    render(<TimerControls {...defaultProps} />);

    const speechSwitch = screen.getByLabelText(/speak numbers/i);
    expect(speechSwitch).toBeInTheDocument();
    expect(speechSwitch).not.toBeChecked();
    expect(speechSwitch).not.toBeDisabled();
  });

  it('should call onSpeechChange when speech switch is toggled', () => {
    const onSpeechChange = jest.fn();
    render(<TimerControls {...defaultProps} onSpeechChange={onSpeechChange} />);

    const speechSwitch = screen.getByLabelText(/speak numbers/i);
    fireEvent.click(speechSwitch);

    expect(onSpeechChange).toHaveBeenCalledWith(true);
  });

  it('should disable speech switch when muted', () => {
    render(<TimerControls {...defaultProps} isMuted={true} />);

    const speechSwitch = screen.getByLabelText(/speak numbers/i);
    expect(speechSwitch).toBeDisabled();
  });

  it('should show switches as checked when props are true', () => {
    render(<TimerControls {...defaultProps} isMuted={true} useSpeech={true} />);

    const muteSwitch = screen.getByLabelText(/mute/i);
    const speechSwitch = screen.getByLabelText(/speak numbers/i);

    expect(muteSwitch).toBeChecked();
    expect(speechSwitch).toBeChecked();
  });
});
