import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing a looping timer based on elapsed time since start.
 * Uses multiple strategies to ensure it continues running in background tabs.
 *
 * @param loopLengthInSeconds - The length of each loop cycle in seconds
 * @returns Object containing progress (0-1) and time remaining in seconds
 */
export const useTimer = (loopLengthInSeconds: number) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestRef = useRef<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Update current time every 100ms for smooth animation
  const updateCurrentTime = useCallback(() => {
    setCurrentTime(Date.now());
  }, []);

  // Handle visibility changes to boost timer when tab becomes visible
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    isVisibleRef.current = isVisible;

    if (isVisible) {
      // Force immediate update when tab becomes visible
      updateCurrentTime();
    }
  }, [updateCurrentTime]);

  // Initialize background timer strategies
  useEffect(() => {
    // Strategy 1: Page Visibility API
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Strategy 2: Create a Web Worker for background timing (if supported)
    try {
      // Create inline worker for cross-browser compatibility
      const workerScript = `
        let interval;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            interval = setInterval(() => {
              self.postMessage('tick');
            }, 50); // High frequency for accuracy
          } else if (e.data === 'stop') {
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          }
        };
      `;

      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      workerRef.current = new Worker(workerUrl);

      workerRef.current.onmessage = () => {
        updateCurrentTime();
      };

      workerRef.current.postMessage('start');

      // Clean up blob URL
      URL.revokeObjectURL(workerUrl);
    } catch (error) {
      console.warn('Web Worker not supported, using fallback timing strategy');
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (workerRef.current) {
        workerRef.current.postMessage('stop');
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [handleVisibilityChange, updateCurrentTime]);

  // Strategy 3: Multiple timing mechanisms
  useEffect(() => {
    // Clear existing timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    // High-frequency setInterval as primary timer
    intervalRef.current = setInterval(updateCurrentTime, 50);

    // RequestAnimationFrame for smooth visible updates
    const animationLoop = () => {
      if (isVisibleRef.current) {
        updateCurrentTime();
      }
      requestRef.current = requestAnimationFrame(animationLoop);
    };
    requestRef.current = requestAnimationFrame(animationLoop);

    // Strategy 4: Backup timeout chain for critical timing
    const timeoutChain = () => {
      updateCurrentTime();
      setTimeout(timeoutChain, 100);
    };
    setTimeout(timeoutChain, 100);

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [updateCurrentTime]);

  // Calculate progress and time remaining
  const elapsedSeconds = (currentTime - startTimeRef.current) / 1000;
  const cyclePosition = elapsedSeconds % loopLengthInSeconds;
  const progress = cyclePosition / loopLengthInSeconds;
  const timeRemaining = loopLengthInSeconds - cyclePosition;

  return {
    progress,
    timeRemaining,
    elapsedSeconds,
    cyclePosition,
  };
};
