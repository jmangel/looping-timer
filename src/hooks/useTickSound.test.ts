import { renderHook } from '@testing-library/react';
import { useTickSound } from './useTickSound';

// Mock HTMLAudioElement
const mockPlay = jest.fn().mockResolvedValue(undefined);
const mockPause = jest.fn();
const mockLoad = jest.fn();

const mockAudioInstance = {
  play: mockPlay,
  pause: mockPause,
  load: mockLoad,
  currentTime: 0,
  volume: 1,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
};

// Mock Audio constructor
(global as any).Audio = jest.fn().mockImplementation(() => mockAudioInstance);

describe('useTickSound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an audio instance on mount', () => {
    renderHook(() => useTickSound());

    expect(global.Audio).toHaveBeenCalledWith('/sounds/tick.mp3');
  });

  it('should play sound when seconds change from higher to lower value', () => {
    const { rerender } = renderHook(
      ({ timeRemaining }) => useTickSound(timeRemaining),
      { initialProps: { timeRemaining: 30.5 } }
    );

    // Clear any calls from initial render
    jest.clearAllMocks();

    // Second changes from 31 to 30 (30.5 -> 29.8)
    rerender({ timeRemaining: 29.8 });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should not play sound when seconds remain the same', () => {
    const { rerender } = renderHook(
      ({ timeRemaining }) => useTickSound(timeRemaining),
      { initialProps: { timeRemaining: 30.3 } }
    );

    // Clear any calls from initial render
    jest.clearAllMocks();

    // Same second (30.3 -> 30.1)
    rerender({ timeRemaining: 30.1 });

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('should play sound when timer loops back to start', () => {
    const { rerender } = renderHook(
      ({ timeRemaining }) => useTickSound(timeRemaining),
      { initialProps: { timeRemaining: 0.9 } }
    );

    // Clear any calls from initial render
    jest.clearAllMocks();

    // Timer loops back (0.9 -> 29.9) - this should trigger the loop-back condition
    rerender({ timeRemaining: 29.9 });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should handle audio play errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockPlay.mockRejectedValueOnce(new Error('Audio play failed'));

    const { rerender } = renderHook(
      ({ timeRemaining }) => useTickSound(timeRemaining),
      { initialProps: { timeRemaining: 30.5 } }
    );

    // Clear initial calls
    jest.clearAllMocks();

    rerender({ timeRemaining: 29.8 });

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Should not throw and should log error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error playing tick sound:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should not play sound on first render', () => {
    renderHook(() => useTickSound(29.5));

    // Should not play on initial render since there's no previous value to compare
    expect(mockPlay).not.toHaveBeenCalled();
  });
});
