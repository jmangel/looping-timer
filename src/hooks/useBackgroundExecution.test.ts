import { renderHook, act } from '@testing-library/react';
import { useBackgroundExecution } from './useBackgroundExecution';

// Mock implementations
const mockAudioContext = {
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
};

const mockSuspendedAudioContext = {
  state: 'suspended',
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
};

// Global mocks
(global as any).AudioContext = jest.fn(() => mockAudioContext);
(global as any).Notification = {
  permission: 'default',
  requestPermission: jest.fn().mockResolvedValue('granted'),
};

Object.defineProperty(document, 'hidden', {
  writable: true,
  value: false,
});

describe('useBackgroundExecution', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    (document as any).hidden = false;
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useBackgroundExecution());

    expect(result.current.isVisible).toBe(true);
    expect(result.current.hasUserInteracted).toBe(false);
    expect(result.current.supportsBackgroundExecution).toBe(true); // Assuming modern browser
    expect(result.current.audioPermissionGranted).toBe(false);
  });

  it('should set up event listeners on mount', () => {
    renderHook(() => useBackgroundExecution());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );

    const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
    interactionEvents.forEach((event) => {
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        event,
        expect.any(Function),
        { once: true, passive: true }
      );
    });
  });

  it('should handle visibility changes', async () => {
    const { result } = renderHook(() => useBackgroundExecution());

    // Simulate tab becoming hidden
    act(() => {
      (document as any).hidden = true;
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.isVisible).toBe(false);

    // Simulate tab becoming visible again
    act(() => {
      (document as any).hidden = false;
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('should handle user interaction and create audio context', async () => {
    const { result } = renderHook(() => useBackgroundExecution());

    expect(result.current.hasUserInteracted).toBe(false);
    expect(result.current.audioPermissionGranted).toBe(false);

    // Simulate user click
    await act(async () => {
      document.dispatchEvent(new Event('click'));
      // Allow async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.hasUserInteracted).toBe(true);
    expect(result.current.audioPermissionGranted).toBe(true);
    expect(global.AudioContext).toHaveBeenCalled();
  });

  it('should handle suspended audio context and resume it', async () => {
    (global as any).AudioContext = jest.fn(() => mockSuspendedAudioContext);

    const { result } = renderHook(() => useBackgroundExecution());

    await act(async () => {
      document.dispatchEvent(new Event('click'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockSuspendedAudioContext.resume).toHaveBeenCalled();
  });

  it('should request background permissions', async () => {
    const { result } = renderHook(() => useBackgroundExecution());

    let permissionResult;
    await act(async () => {
      permissionResult = await result.current.requestBackgroundPermissions();
    });

    expect(permissionResult).toBe(true);
    expect(global.Notification.requestPermission).toHaveBeenCalled();
  });

  it('should handle audio context resume manually', async () => {
    (global as any).AudioContext = jest.fn(() => mockSuspendedAudioContext);

    const { result } = renderHook(() => useBackgroundExecution());

    // First, trigger user interaction to create audio context
    await act(async () => {
      document.dispatchEvent(new Event('click'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Reset the mock
    mockSuspendedAudioContext.resume.mockClear();

    // Now test manual resume
    let resumeResult;
    await act(async () => {
      resumeResult = await result.current.resumeAudioContext();
    });

    expect(mockSuspendedAudioContext.resume).toHaveBeenCalled();
    expect(resumeResult).toBe(false); // Still suspended in mock
  });

  it('should handle audio context creation errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    (global as any).AudioContext = jest.fn(() => {
      throw new Error('AudioContext creation failed');
    });

    const { result } = renderHook(() => useBackgroundExecution());

    await act(async () => {
      document.dispatchEvent(new Event('click'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Could not initialize audio context:',
      expect.any(Error)
    );
    expect(result.current.audioPermissionGranted).toBe(false);

    consoleSpy.mockRestore();
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useBackgroundExecution());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );

    const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
    interactionEvents.forEach((event) => {
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        event,
        expect.any(Function)
      );
    });
  });

  it('should handle wake lock request', async () => {
    const mockWakeLock = {
      request: jest.fn().mockResolvedValue({}),
    };
    (global.navigator as any).wakeLock = mockWakeLock;

    const { result } = renderHook(() => useBackgroundExecution());

    await act(async () => {
      await result.current.requestBackgroundPermissions();
    });

    expect(mockWakeLock.request).toHaveBeenCalledWith('screen');
  });

  it('should handle notification permission errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    global.Notification.requestPermission = jest
      .fn()
      .mockRejectedValue(new Error('Permission denied'));

    const { result } = renderHook(() => useBackgroundExecution());

    let permissionResult;
    await act(async () => {
      permissionResult = await result.current.requestBackgroundPermissions();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Could not request background permissions:',
      expect.any(Error)
    );
    expect(permissionResult).toBe(false);

    consoleSpy.mockRestore();
  });
});
