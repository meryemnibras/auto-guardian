"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  GeolocationErrorCode,
  GeolocationSnapshot,
  GeolocationStatus,
} from "@/types/emergency";

interface UseCurrentPosition {
  position: GeolocationSnapshot | null;
  status: GeolocationStatus;
  error: GeolocationErrorCode | null;
  isSupported: boolean;
  getCurrentPositionOnce: () => Promise<GeolocationSnapshot | null>;
  startWatching: () => void;
  stopWatching: () => void;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 5_000,
};

function mapError(code: number): GeolocationErrorCode {
  if (code === 1) return "permission-denied";
  if (code === 2) return "unavailable";
  if (code === 3) return "timeout";
  return "unavailable";
}

function toSnapshot(p: GeolocationPosition): GeolocationSnapshot {
  return {
    lat: p.coords.latitude,
    lng: p.coords.longitude,
    accuracy: p.coords.accuracy,
    timestamp: p.timestamp,
  };
}

export function useCurrentPosition(): UseCurrentPosition {
  const isSupported =
    typeof navigator !== "undefined" && "geolocation" in navigator;

  const [position, setPosition] = useState<GeolocationSnapshot | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>(
    isSupported ? "idle" : "unsupported"
  );
  const [error, setError] = useState<GeolocationErrorCode | null>(
    isSupported ? null : "unsupported"
  );

  const watchIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (mountedRef.current) {
      setStatus((current) => (current === "watching" ? "idle" : current));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (watchIdRef.current !== null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const getCurrentPositionOnce = useCallback((): Promise<GeolocationSnapshot | null> => {
    return new Promise((resolve) => {
      if (!isSupported) {
        setStatus("unsupported");
        setError("unsupported");
        resolve(null);
        return;
      }
      setStatus("requesting");
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (p) => {
          if (!mountedRef.current) return resolve(toSnapshot(p));
          const snap = toSnapshot(p);
          setPosition(snap);
          setStatus("success");
          resolve(snap);
        },
        (err) => {
          const code = mapError(err.code);
          if (mountedRef.current) {
            setError(code);
            setStatus(code === "permission-denied" ? "permission-denied" : "error");
          }
          resolve(null);
        },
        GEO_OPTIONS
      );
    });
  }, [isSupported]);

  const startWatching = useCallback(() => {
    if (!isSupported) {
      setStatus("unsupported");
      setError("unsupported");
      return;
    }
    if (watchIdRef.current !== null) return;
    setStatus("watching");
    setError(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        if (!mountedRef.current) return;
        setPosition(toSnapshot(p));
      },
      (err) => {
        if (!mountedRef.current) return;
        const code = mapError(err.code);
        setError(code);
        setStatus(code === "permission-denied" ? "permission-denied" : "error");
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      GEO_OPTIONS
    );
  }, [isSupported]);

  return {
    position,
    status,
    error,
    isSupported,
    getCurrentPositionOnce,
    startWatching,
    stopWatching,
  };
}
