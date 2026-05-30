"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSOSCountdownOptions {
  durationSeconds?: number;
  onComplete: () => void;
}

interface UseSOSCountdown {
  isActive: boolean;
  remainingSeconds: number;
  start: () => void;
  cancel: () => void;
}

export function useSOSCountdown(
  options: UseSOSCountdownOptions
): UseSOSCountdown {
  const { durationSeconds = 10, onComplete } = options;

  const [isActive, setIsActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    clear();
    setIsActive(false);
    setRemainingSeconds(durationSeconds);
  }, [clear, durationSeconds]);

  const start = useCallback(() => {
    if (intervalRef.current !== null) return;
    setIsActive(true);
    setRemainingSeconds(durationSeconds);
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          clear();
          setIsActive(false);
          // Defer onComplete so subscribers see remaining=0 before side effects.
          queueMicrotask(() => onCompleteRef.current());
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [clear, durationSeconds]);

  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return { isActive, remainingSeconds, start, cancel };
}
