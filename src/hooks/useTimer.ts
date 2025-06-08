import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing a looping timer based on elapsed time since start.
 *
 * @param loopLengthInSeconds - The length of each loop cycle in seconds
 * @returns Object containing progress (0-1) and time remaining in seconds
 */
export const useTimer = (loopLengthInSeconds: number) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update current time every 100ms for smooth animation
  const updateCurrentTime = useCallback(() => {
    setCurrentTime(Date.now());
  }, []);

  // Setup interval with proper cleanup
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(updateCurrentTime, 100);

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
