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

// Mock Speech Synthesis API
const mockSpeak = jest.fn();
const mockCancel = jest.fn();
const mockSpeechSynthesis = {
  speak: mockSpeak,
  cancel: mockCancel,
  speaking: false,
  pending: false,
  paused: false,
};

Object.defineProperty(global, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true,
});

(global as any).SpeechSynthesisUtterance = jest
  .fn()
  .mockImplementation((text) => ({
    text,
    volume: 1,
    rate: 1,
    pitch: 1,
  }));

describe('useTickSound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an audio instance on mount', () => {
    renderHook(() => useTickSound());

    expect(global.Audio).toHaveBeenCalledWith('/sounds/tick.mp3');
  });

  it('should play sound when seconds change', () => {
    const { rerender } = renderHook(
      ({ currentSeconds }) => useTickSound(currentSeconds),
      { initialProps: { currentSeconds: 1.2 } }
    );

    // Clear any calls from initial render
    jest.clearAllMocks();

    // Second changes from 2 to 1 (1.2 -> 0.8)
    rerender({ currentSeconds: 0.8 });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should not play sound when muted', () => {
    const { rerender } = renderHook(
      ({ currentSeconds, isMuted }) =>
        useTickSound(currentSeconds, { isMuted }),
      { initialProps: { currentSeconds: 1.2, isMuted: true } }
    );

    // Clear any calls from initial render
    jest.clearAllMocks();

    // Second changes from 2 to 1 (1.2 -> 0.8)
    rerender({ currentSeconds: 0.8, isMuted: true });

    expect(mockPlay).not.toHaveBeenCalled();
    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('should speak number when useSpeech is true', () => {
    const { rerender } = renderHook(
      ({ currentSeconds, useSpeech }) =>
        useTickSound(currentSeconds, { useSpeech }),
      { initialProps: { currentSeconds: 1.2, useSpeech: true } }
    );

    // Clear any calls from initial render
    jest.clearAllMocks();

    // Second changes from 2 to 1 (1.2 -> 0.8)
    rerender({ currentSeconds: 0.8, useSpeech: true });

    expect(mockPlay).not.toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
    expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('1');
  });

  it('should not play sound when seconds remain the same', () => {
    const { rerender } = renderHook(
      ({ currentSeconds }) => useTickSound(currentSeconds),
      { initialProps: { currentSeconds: 1.3 } }
    );

    // Clear any calls from initial render
    jest.clearAllMocks();

    // Same second (1.3 -> 1.1)
    rerender({ currentSeconds: 1.1 });

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('should play sound when timer increments to next second', () => {
    const { rerender } = renderHook(
      ({ currentSeconds }) => useTickSound(currentSeconds),
      { initialProps: { currentSeconds: 0.9 } }
    );

    // Clear any calls from initial render
    jest.clearAllMocks();

    // Timer increments to next second (0.9 -> 1.1)
    rerender({ currentSeconds: 1.1 });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should handle audio play errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockPlay.mockRejectedValueOnce(new Error('Audio play failed'));

    const { rerender } = renderHook(
      ({ currentSeconds }) => useTickSound(currentSeconds),
      { initialProps: { currentSeconds: 1.5 } }
    );

    // Clear initial calls
    jest.clearAllMocks();

    rerender({ currentSeconds: 0.8 });

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
    renderHook(() => useTickSound(1.5));

    // Should not play on initial render since there's no previous value to compare
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('should clean up speech synthesis on unmount', () => {
    const { unmount } = renderHook(() => useTickSound(1, { useSpeech: true }));

    unmount();

    expect(mockCancel).toHaveBeenCalled();
  });

  describe('tickInterval functionality', () => {
    it('should only play sound at specified intervals', () => {
      const { rerender } = renderHook(
        ({ currentSeconds }) =>
          useTickSound(currentSeconds, { tickInterval: 5 }),
        { initialProps: { currentSeconds: 29.8 } }
      );

      // Clear any calls from initial render
      jest.clearAllMocks();

      // Change to second 29 (not a multiple of 5)
      rerender({ currentSeconds: 28.9 });
      expect(mockPlay).not.toHaveBeenCalled();

      // Change to second 25 (multiple of 5)
      rerender({ currentSeconds: 24.9 });
      expect(mockPlay).toHaveBeenCalledTimes(1);

      // Clear calls
      jest.clearAllMocks();

      // Change to second 23 (not a multiple of 5)
      rerender({ currentSeconds: 22.8 });
      expect(mockPlay).not.toHaveBeenCalled();

      // Change to second 20 (multiple of 5)
      rerender({ currentSeconds: 19.9 });
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    it('should speak numbers only at specified intervals', () => {
      const { rerender } = renderHook(
        ({ currentSeconds }) =>
          useTickSound(currentSeconds, {
            useSpeech: true,
            tickInterval: 5,
          }),
        { initialProps: { currentSeconds: 12.8 } }
      );

      // Clear any calls from initial render
      jest.clearAllMocks();

      // Change to second 12 (not a multiple of 5)
      rerender({ currentSeconds: 11.9 });
      expect(mockSpeak).not.toHaveBeenCalled();

      // Change to second 10 (multiple of 5)
      rerender({ currentSeconds: 9.9 });
      expect(mockSpeak).toHaveBeenCalledTimes(1);
      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('10');
    });

    it('should work with tickInterval of 1 (every second)', () => {
      const { rerender } = renderHook(
        ({ currentSeconds }) =>
          useTickSound(currentSeconds, { tickInterval: 1 }),
        { initialProps: { currentSeconds: 3.8 } }
      );

      // Clear any calls from initial render
      jest.clearAllMocks();

      // Every second should trigger sound
      rerender({ currentSeconds: 2.9 });
      expect(mockPlay).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();
      rerender({ currentSeconds: 1.8 });
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    it('should default to tickInterval of 1 when not specified', () => {
      const { rerender } = renderHook(
        ({ currentSeconds }) => useTickSound(currentSeconds),
        { initialProps: { currentSeconds: 5.8 } }
      );

      // Clear any calls from initial render
      jest.clearAllMocks();

      // Should play every second (default interval of 1)
      rerender({ currentSeconds: 4.9 });
      expect(mockPlay).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();
      rerender({ currentSeconds: 3.9 });
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    it('should respect mute setting even with tickInterval', () => {
      const { rerender } = renderHook(
        ({ currentSeconds }) =>
          useTickSound(currentSeconds, {
            tickInterval: 5,
            isMuted: true,
          }),
        { initialProps: { currentSeconds: 15.2 } }
      );

      // Clear any calls from initial render
      jest.clearAllMocks();

      // Change to second 10 (multiple of 5) but muted
      rerender({ currentSeconds: 9.9 });
      expect(mockPlay).not.toHaveBeenCalled();
      expect(mockSpeak).not.toHaveBeenCalled();
    });

    it('should handle edge case when timer reaches zero', () => {
      const { rerender } = renderHook(
        ({ currentSeconds }) =>
          useTickSound(currentSeconds, { tickInterval: 5 }),
        { initialProps: { currentSeconds: 1.2 } }
      );

      // Clear any calls from initial render
      jest.clearAllMocks();

      // Timer reaches 0, which should not be treated as a multiple of 5
      rerender({ currentSeconds: 0 });
      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('should work with larger intervals', () => {
      const { rerender } = renderHook(
        ({ currentSeconds }) =>
          useTickSound(currentSeconds, { tickInterval: 10 }),
        { initialProps: { currentSeconds: 35.5 } }
      );

      // Clear any calls from initial render
      jest.clearAllMocks();

      // Change to second 32 (not a multiple of 10)
      rerender({ currentSeconds: 31.8 });
      expect(mockPlay).not.toHaveBeenCalled();

      // Change to second 30 (multiple of 10)
      rerender({ currentSeconds: 29.9 });
      expect(mockPlay).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      // Change to second 20 (multiple of 10)
      rerender({ currentSeconds: 19.8 });
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });
  });
});
