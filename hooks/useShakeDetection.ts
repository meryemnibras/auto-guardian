"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MotionPermissionStatus } from "@/types/emergency";

interface UseShakeDetectionOptions {
  threshold?: number;
  shakesRequired?: number;
  windowMs?: number;
  cooldownMs?: number;
  onShakeDetected?: () => void;
}

interface UseShakeDetection {
  isSupported: boolean;
  permissionStatus: MotionPermissionStatus;
  isListening: boolean;
  lastShakeAt: number | null;
  error: string | null;
  requestMotionPermission: () => Promise<MotionPermissionStatus>;
  startListening: () => void;
  stopListening: () => void;
}

// iOS 13+ exposes DeviceMotionEvent.requestPermission as a static method;
// the standard lib does not type it. This narrow type lets us feature-detect.
type DeviceMotionEventConstructorIOS = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function getCtor(): DeviceMotionEventConstructorIOS | null {
  if (typeof window === "undefined") return null;
  if (typeof DeviceMotionEvent === "undefined") return null;
  return DeviceMotionEvent as DeviceMotionEventConstructorIOS;
}

function initialPermissionStatus(): MotionPermissionStatus {
  const ctor = getCtor();
  if (!ctor) return "unsupported";
  if (typeof ctor.requestPermission === "function") return "requires-permission";
  return "unknown";
}

export function useShakeDetection(
  options: UseShakeDetectionOptions = {}
): UseShakeDetection {
  const {
    threshold = 25,
    shakesRequired = 3,
    windowMs = 1500,
    cooldownMs = 5000,
    onShakeDetected,
  } = options;

  const [permissionStatus, setPermissionStatus] = useState<MotionPermissionStatus>(
    () => initialPermissionStatus()
  );
  const [isListening, setIsListening] = useState(false);
  const [lastShakeAt, setLastShakeAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callbackRef = useRef(onShakeDetected);
  callbackRef.current = onShakeDetected;

  const shakeTimesRef = useRef<number[]>([]);
  const cooldownUntilRef = useRef<number>(0);
  const handlerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);
  const mountedRef = useRef(true);

  const isSupported = permissionStatus !== "unsupported";

  const stopListening = useCallback(() => {
    if (handlerRef.current && typeof window !== "undefined") {
      window.removeEventListener("devicemotion", handlerRef.current);
      handlerRef.current = null;
    }
    if (mountedRef.current) setIsListening(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (handlerRef.current && typeof window !== "undefined") {
        window.removeEventListener("devicemotion", handlerRef.current);
        handlerRef.current = null;
      }
    };
  }, []);

  const requestMotionPermission = useCallback(async (): Promise<MotionPermissionStatus> => {
    const ctor = getCtor();
    if (!ctor) {
      setPermissionStatus("unsupported");
      return "unsupported";
    }
    if (typeof ctor.requestPermission !== "function") {
      setPermissionStatus("granted");
      return "granted";
    }
    try {
      const result = await ctor.requestPermission();
      const status: MotionPermissionStatus =
        result === "granted" ? "granted" : "denied";
      if (mountedRef.current) setPermissionStatus(status);
      return status;
    } catch (e) {
      if (mountedRef.current) {
        setPermissionStatus("denied");
        setError(e instanceof Error ? e.message : String(e));
      }
      return "denied";
    }
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const ctor = getCtor();
    if (!ctor) {
      setPermissionStatus("unsupported");
      return;
    }
    if (permissionStatus === "denied") return;
    if (permissionStatus === "requires-permission") {
      // Caller must request permission first; refuse to start silently.
      return;
    }
    if (handlerRef.current) return;

    const handler = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude < threshold) return;

      const now = Date.now();
      if (cooldownUntilRef.current > now) return;

      const recent = shakeTimesRef.current.filter((t) => now - t < windowMs);
      recent.push(now);
      shakeTimesRef.current = recent;

      if (recent.length >= shakesRequired) {
        shakeTimesRef.current = [];
        cooldownUntilRef.current = now + cooldownMs;
        if (mountedRef.current) setLastShakeAt(now);
        callbackRef.current?.();
      }
    };

    handlerRef.current = handler;
    window.addEventListener("devicemotion", handler);
    setIsListening(true);
  }, [permissionStatus, threshold, shakesRequired, windowMs, cooldownMs]);

  return {
    isSupported,
    permissionStatus,
    isListening,
    lastShakeAt,
    error,
    requestMotionPermission,
    startListening,
    stopListening,
  };
}
