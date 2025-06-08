import { useState, useEffect, useCallback } from 'react';

/**
 * Configuration object for timer controls that can be persisted in URL query parameters
 */
export interface TimerConfig {
  loopLength: number;
  tickInterval: number;
  isMuted: boolean;
  useSpeech: boolean;
}

/**
 * Custom hook for managing timer configuration in URL query parameters.
 * Automatically syncs values with the browser URL and provides defaults.
 *
 * @param defaults - Default values for timer configuration
 * @returns Object containing current values and update function
 */
export const useQueryParams = (defaults: TimerConfig) => {
  const [values, setValues] = useState<TimerConfig>(defaults);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse query parameters from URL
  const parseQueryParams = useCallback((): Partial<TimerConfig> => {
    const params = new URLSearchParams(window.location.search);
    const parsed: Partial<TimerConfig> = {};

    // Parse loopLength
    const loopLength = params.get('loopLength');
    if (loopLength !== null) {
      const num = parseInt(loopLength, 10);
      if (!isNaN(num) && num > 0) {
        parsed.loopLength = num;
      }
    }

    // Parse tickInterval
    const tickInterval = params.get('tickInterval');
    if (tickInterval !== null) {
      const num = parseInt(tickInterval, 10);
      if (!isNaN(num) && num > 0) {
        parsed.tickInterval = num;
      }
    }

    // Parse isMuted
    const isMuted = params.get('isMuted');
    if (isMuted !== null) {
      parsed.isMuted = isMuted === 'true';
    }

    // Parse useSpeech
    const useSpeech = params.get('useSpeech');
    if (useSpeech !== null) {
      parsed.useSpeech = useSpeech === 'true';
    }

    return parsed;
  }, []);

  // Update URL with current values
  const updateURL = useCallback(
    (newValues: TimerConfig) => {
      const params = new URLSearchParams();

      // Only add parameters that differ from defaults
      Object.entries(newValues).forEach(([key, value]) => {
        const defaultValue = defaults[key as keyof TimerConfig];
        if (value !== defaultValue) {
          params.set(key, String(value));
        }
      });

      // Build new URL
      const baseUrl =
        (window.location.origin || 'http://localhost:3000') +
        window.location.pathname;
      const queryString = params.toString();
      const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      // Update browser URL without page reload
      window.history.replaceState(null, '', newUrl);
    },
    [defaults]
  );

  // Initialize values from URL on mount
  useEffect(() => {
    const parsedParams = parseQueryParams();
    const initialValues = { ...defaults, ...parsedParams };
    setValues(initialValues);
    setIsInitialized(true);
  }, [defaults, parseQueryParams]);

  // Sync URL whenever values change (but not during initialization)
  useEffect(() => {
    if (isInitialized) {
      updateURL(values);
    }
  }, [values, updateURL, isInitialized]);

  // Update a specific value (URL sync happens automatically via useEffect)
  const updateValue = useCallback(
    <K extends keyof TimerConfig>(key: K, value: TimerConfig[K]) => {
      setValues((prevValues) => ({ ...prevValues, [key]: value }));
    },
    []
  );

  return {
    values,
    updateValue,
  };
};
