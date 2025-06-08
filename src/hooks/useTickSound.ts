import { useEffect, useRef } from 'react';

interface TickSoundOptions {
  isMuted?: boolean;
  useSpeech?: boolean;
  tickInterval?: number;
}

/**
 * Custom hook that plays a tick sound or speaks numbers when the seconds value changes.
 * Useful for timer applications to provide audio feedback.
 * Enhanced to work in background tabs and request necessary permissions.
 *
 * @param currentSeconds - The current seconds in the cycle
 * @param options - Configuration options for sound behavior
 */
export const useTickSound = (
  currentSeconds?: number,
  options: TickSoundOptions = {}
) => {
  const { isMuted = false, useSpeech = false, tickInterval = 1 } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousSecondsRef = useRef<number | null>(null);
  const userInteractedRef = useRef<boolean>(false);

  // Request audio permissions and setup audio context
  const requestAudioPermissions = async () => {
    try {
      // Request microphone permission to enable background audio (workaround)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // Immediately stop the stream - we just needed the permission
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.warn('Could not request audio permissions:', error);
    }

    try {
      // Create audio context for better audio control
      if (
        typeof AudioContext !== 'undefined' ||
        typeof (window as any).webkitAudioContext !== 'undefined'
      ) {
        const AudioContextClass =
          AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();

        // Resume audio context in case it's suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      }
    } catch (error) {
      console.warn('Could not create audio context:', error);
    }
  };

  // Handle user interaction to enable audio
  const handleUserInteraction = async () => {
    if (!userInteractedRef.current) {
      userInteractedRef.current = true;
      await requestAudioPermissions();

      // Resume audio context if suspended
      if (
        audioContextRef.current &&
        audioContextRef.current.state === 'suspended'
      ) {
        await audioContextRef.current.resume();
      }
    }
  };

  // Initialize audio on mount
  useEffect(() => {
    const publicUrl = process.env.PUBLIC_URL || '';
    audioRef.current = new Audio(`${publicUrl}/sounds/tick.mp3`);
    audioRef.current.volume = 0.5; // Set moderate volume

    // Preload audio for better performance
    audioRef.current.preload = 'auto';

    // Set audio to allow background playback
    audioRef.current.setAttribute('playsinline', 'true');

    // Add user interaction listeners to enable audio
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    interactionEvents.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, {
        once: true,
        passive: true,
      });
    });

    // Handle page visibility changes for audio context
    const handleVisibilityChange = async () => {
      if (!document.hidden && audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          try {
            await audioContextRef.current.resume();
          } catch (error) {
            console.warn('Could not resume audio context:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (error) {
          // Ignore errors when pausing audio during cleanup
        }
        audioRef.current = null;
      }

      // Clean up audio context
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (error) {
          // Ignore errors when closing audio context
        }
        audioContextRef.current = null;
      }

      // Clean up speech synthesis
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
      }

      // Remove event listeners
      interactionEvents.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        // For intervals > 1, only play on multiples of the interval (excluding 0)
        // For interval = 1, play every second
        const shouldPlay =
          tickInterval === 1 ||
          (roundedSeconds > 0 && roundedSeconds % tickInterval === 0);

        if (shouldPlay) {
          if (useSpeech) {
            speakNumber(roundedSeconds);
          } else {
            playTickSound();
          }
        }
      }
    }

    previousSecondsRef.current = roundedSeconds;
  }, [currentSeconds, isMuted, useSpeech, tickInterval]);

  const playTickSound = async () => {
    if (audioRef.current) {
      try {
        // Ensure audio context is running
        if (
          audioContextRef.current &&
          audioContextRef.current.state === 'suspended'
        ) {
          await audioContextRef.current.resume();
        }

        // Reset audio to beginning and play
        audioRef.current.currentTime = 0;

        // Create a promise-based play with better error handling
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (error) {
        console.error('Error playing tick sound:', error);
        // Try to request user interaction if audio failed
        if (!userInteractedRef.current) {
          console.warn('Audio failed - user interaction may be required');
        }
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

        // Enhanced speech settings for background operation
        utterance.lang = 'en-US';

        // Handle speech errors
        utterance.onerror = (error) => {
          console.warn('Speech synthesis error:', error);
        };

        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error speaking number:', error);
      }
    }
  };
};
