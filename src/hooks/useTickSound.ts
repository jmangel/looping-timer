import { useEffect, useRef } from 'react';

/**
 * Custom hook that plays a tick sound when the seconds value changes (decrements).
 * Useful for timer applications to provide audio feedback.
 *
 * @param timeRemaining - The current time remaining in seconds
 */
export const useTickSound = (timeRemaining?: number) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousSecondsRef = useRef<number | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio('/sounds/tick.mp3');
    audioRef.current.volume = 0.5; // Set moderate volume

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (error) {
          // Ignore errors when pausing audio during cleanup
        }
        audioRef.current = null;
      }
    };
  }, []);

  // Play tick sound when seconds change
  useEffect(() => {
    if (timeRemaining === undefined) return;

    const currentSeconds = Math.ceil(timeRemaining);
    const previousSeconds = previousSecondsRef.current;

    // Play sound if seconds have decremented or if timer has looped back
    if (previousSeconds !== null) {
      const hasSecondChanged = currentSeconds !== previousSeconds;
      const hasLoopedBack =
        currentSeconds > previousSeconds && previousSeconds <= 1;

      if (hasSecondChanged || hasLoopedBack) {
        playTickSound();
      }
    }

    previousSecondsRef.current = currentSeconds;
  }, [timeRemaining]);

  const playTickSound = async () => {
    if (audioRef.current) {
      try {
        // Reset audio to beginning and play
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing tick sound:', error);
      }
    }
  };
};
