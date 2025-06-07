import { useEffect, useRef } from 'react';

interface TickSoundOptions {
  isMuted?: boolean;
  useSpeech?: boolean;
}

/**
 * Custom hook that plays a tick sound or speaks numbers when the seconds value changes.
 * Useful for timer applications to provide audio feedback.
 *
 * @param currentSeconds - The current seconds in the cycle
 * @param options - Configuration options for sound behavior
 */
export const useTickSound = (
  currentSeconds?: number,
  options: TickSoundOptions = {}
) => {
  const { isMuted = false, useSpeech = false } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousSecondsRef = useRef<number | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    const publicUrl = process.env.PUBLIC_URL || '';
    audioRef.current = new Audio(`${publicUrl}/sounds/tick.mp3`);
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

      // Clean up speech synthesis
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Play tick sound or speak number when seconds change
  useEffect(() => {
    if (currentSeconds === undefined) return;

    const roundedSeconds = Math.ceil(currentSeconds);
    const previousSeconds = previousSecondsRef.current;

    // Play sound if seconds have changed
    if (previousSeconds !== null && roundedSeconds !== previousSeconds) {
      if (!isMuted) {
        if (useSpeech) {
          speakNumber(roundedSeconds);
        } else {
          playTickSound();
        }
      }
    }

    previousSecondsRef.current = roundedSeconds;
  }, [currentSeconds, isMuted, useSpeech]);

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

  const speakNumber = (seconds: number) => {
    if (typeof speechSynthesis !== 'undefined') {
      try {
        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(seconds.toString());
        utterance.volume = 0.8;
        utterance.rate = 1.2;
        utterance.pitch = 1;

        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error speaking number:', error);
      }
    }
  };
};
