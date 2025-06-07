import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

// Mock setTimeout and clearTimeout
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useTimer', () => {
  it('should initialize with zero progress and full time remaining', () => {
    const { result } = renderHook(() => useTimer(30));

    expect(result.current.progress).toBeCloseTo(0, 2);
    expect(result.current.timeRemaining).toBeCloseTo(30, 1);
    expect(result.current.elapsedSeconds).toBeCloseTo(0, 2);
    expect(result.current.cyclePosition).toBeCloseTo(0, 2);
  });

  it('should update progress over time', () => {
    const { result } = renderHook(() => useTimer(10));

    // Fast-forward time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Progress should be around 0.5 (5 seconds out of 10)
    expect(result.current.progress).toBeCloseTo(0.5, 1);
    expect(result.current.timeRemaining).toBeCloseTo(5, 1);
    expect(result.current.cyclePosition).toBeCloseTo(5, 1);
  });

  it('should loop back to zero progress after completing a cycle', () => {
    const { result } = renderHook(() => useTimer(5));

    // Fast-forward time by exactly one cycle (5 seconds)
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should be back at the start of the cycle
    expect(result.current.progress).toBeCloseTo(0, 2);
    expect(result.current.timeRemaining).toBeCloseTo(5, 1);
    expect(result.current.cyclePosition).toBeCloseTo(0, 2);
  });

  it('should handle changing loop length', () => {
    const { result, rerender } = renderHook(
      ({ loopLength }) => useTimer(loopLength),
      { initialProps: { loopLength: 10 } }
    );

    // Fast-forward time by 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Change loop length to 6 seconds
    rerender({ loopLength: 6 });

    // Progress should be recalculated based on new loop length
    // 3 seconds out of 6 seconds = 0.5 progress
    expect(result.current.progress).toBeCloseTo(0.5, 1);
    expect(result.current.timeRemaining).toBeCloseTo(3, 1);
  });

  it('should clean up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useTimer(30));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
