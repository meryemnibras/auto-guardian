"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { syncLocalDataToCloud } from "@/lib/sync";
import type { CloudSyncState, SyncStatus, SyncSummary } from "@/types/sync";

export interface UseCloudSync extends CloudSyncState {
  syncData: () => Promise<void>;
}

function initialStatus(): SyncStatus {
  if (!isSupabaseConfigured) return "not-configured";
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "offline";
  }
  return "idle";
}

function readIsOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

export function useCloudSync(): UseCloudSync {
  const [status, setStatus] = useState<SyncStatus>(() => initialStatus());
  const [isOnline, setIsOnline] = useState<boolean>(() => readIsOnline());
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SyncSummary | null>(null);

  const isSyncingRef = useRef(false);
  const mountedRef = useRef(true);
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;

  const syncData = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      setStatus("not-configured");
      return;
    }
    if (isSyncingRef.current) return;
    if (!isOnlineRef.current) {
      setStatus("offline");
      return;
    }

    isSyncingRef.current = true;
    if (mountedRef.current) {
      setStatus("syncing");
      setError(null);
    }

    let result: SyncSummary | null = null;
    try {
      result = await syncLocalDataToCloud();
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
      isSyncingRef.current = false;
      return;
    }

    isSyncingRef.current = false;
    if (!mountedRef.current) return;

    setSummary(result);
    setLastSyncedAt(result.lastSyncedAt);

    if (result.errors.length > 0) {
      const first = result.errors[0];
      if (first === "supabase-not-configured") {
        setStatus("not-configured");
      } else {
        setError(first);
        setStatus("error");
      }
      return;
    }
    setStatus("synced");
  }, []);

  // Wire online/offline events + initial sync attempt on mount.
  useEffect(() => {
    mountedRef.current = true;
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      if (!mountedRef.current) return;
      setIsOnline(true);
      if (status !== "syncing") setStatus("idle");
      void syncData();
    };

    const handleOffline = () => {
      if (!mountedRef.current) return;
      setIsOnline(false);
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Attempt one sync on mount if conditions allow.
    if (isSupabaseConfigured && readIsOnline()) {
      void syncData();
    }

    return () => {
      mountedRef.current = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // syncData/status intentionally omitted — handlers read via refs/closures
    // and we only want to wire listeners once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    isOnline,
    isSyncing: status === "syncing",
    lastSyncedAt,
    error,
    summary,
    syncData,
  };
}
