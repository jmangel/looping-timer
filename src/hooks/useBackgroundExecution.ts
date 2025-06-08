import { useEffect, useRef, useState, useCallback } from 'react';

interface BackgroundExecutionState {
  isVisible: boolean;
  hasUserInteracted: boolean;
  supportsBackgroundExecution: boolean;
  audioPermissionGranted: boolean;
}

/**
 * Custom hook for managing background execution capabilities.
 * Handles user interaction requirements, visibility changes, and background permissions.
 *
 * @returns Object containing background execution state and utility functions
 */
export const useBackgroundExecution = () => {
  const [state, setState] = useState<BackgroundExecutionState>({
    isVisible: !document.hidden,
    hasUserInteracted: false,
    supportsBackgroundExecution:
      'requestIdleCallback' in window && 'Worker' in window,
    audioPermissionGranted: false,
  });

  const userInteractionRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Handle visibility changes
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    setState((prev) => ({ ...prev, isVisible }));

    // Resume audio context when tab becomes visible
    if (
      isVisible &&
      audioContextRef.current &&
      audioContextRef.current.state === 'suspended'
    ) {
      audioContextRef.current.resume().catch(console.warn);
    }
  }, []);

  // Handle user interaction
  const handleUserInteraction = useCallback(async () => {
    if (!userInteractionRef.current) {
      userInteractionRef.current = true;

      let audioPermissionGranted = false;

      try {
        // Request audio context permissions
        if (
          typeof AudioContext !== 'undefined' ||
          typeof (window as any).webkitAudioContext !== 'undefined'
        ) {
          const AudioContextClass =
            AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();

          if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
          }

          audioPermissionGranted = audioContextRef.current.state === 'running';
        }
      } catch (error) {
        console.warn('Could not initialize audio context:', error);
      }

      setState((prev) => ({
        ...prev,
        hasUserInteracted: true,
        audioPermissionGranted,
      }));
    }
  }, []);

  // Request background execution permissions
  const requestBackgroundPermissions = useCallback(async () => {
    try {
      // Request notification permission for background awareness
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Request wake lock to keep screen active (optional)
      if ('wakeLock' in navigator) {
        try {
          await (navigator as any).wakeLock.request('screen');
        } catch (error) {
          // Wake lock is optional, ignore errors
        }
      }

      return true;
    } catch (error) {
      console.warn('Could not request background permissions:', error);
      return false;
    }
  }, []);

  // Initialize event listeners
  useEffect(() => {
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for user interactions
    const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
    interactionEvents.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, {
        once: true,
        passive: true,
      });
    });

    // Request permissions on mount
    if (!userInteractionRef.current) {
      // Wait for first user interaction before requesting permissions
      const requestOnInteraction = async () => {
        await handleUserInteraction();
        await requestBackgroundPermissions();
      };

      interactionEvents.forEach((event) => {
        document.addEventListener(event, requestOnInteraction, {
          once: true,
          passive: true,
        });
      });
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      interactionEvents.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });

      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.warn);
        audioContextRef.current = null;
      }
    };
  }, [
    handleVisibilityChange,
    handleUserInteraction,
    requestBackgroundPermissions,
  ]);

  // Force audio context resume
  const resumeAudioContext = useCallback(async () => {
    if (
      audioContextRef.current &&
      audioContextRef.current.state === 'suspended'
    ) {
      try {
        await audioContextRef.current.resume();
        setState((prev) => ({ ...prev, audioPermissionGranted: true }));
        return true;
      } catch (error) {
        console.warn('Could not resume audio context:', error);
        return false;
      }
    }
    return audioContextRef.current?.state === 'running';
  }, []);

  return {
    ...state,
    audioContext: audioContextRef.current,
    requestBackgroundPermissions,
    resumeAudioContext,
  };
};
