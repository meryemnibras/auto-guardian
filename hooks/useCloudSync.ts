"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { syncLocalDataToCloud } from "@/lib/sync";
import { useAuth } from "@/components/auth/AuthProvider";
import type { CloudSyncState, SyncStatus, SyncSummary } from "@/types/sync";

export interface UseCloudSync extends CloudSyncState {
  syncData: () => Promise<void>;
}

function readIsOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

/**
 * Cloud sync hook. Syncing only happens when Supabase is configured AND a user
 * is signed in. When logged out (or not configured) the hook sits in an idle/
 * not-configured state without raising errors. A sync runs automatically on
 * sign-in and whenever the network comes back online.
 */
export function useCloudSync(): UseCloudSync {
  const { user, configured } = useAuth();

  const [status, setStatus] = useState<SyncStatus>(
    isSupabaseConfigured ? "idle" : "not-configured"
  );
  const [isOnline, setIsOnline] = useState<boolean>(() => readIsOnline());
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SyncSummary | null>(null);

  const isSyncingRef = useRef(false);
  const mountedRef = useRef(true);
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;
  const userIdRef = useRef<string | null>(user?.id ?? null);
  userIdRef.current = user?.id ?? null;

  const syncData = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      setStatus("not-configured");
      return;
    }
    if (!userIdRef.current) {
      // Logged out — nothing to sync, but this is not an error state.
      setStatus("idle");
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
    if (result.lastSyncedAt) setLastSyncedAt(result.lastSyncedAt);

    if (result.errors.length > 0) {
      const first = result.errors[0];
      if (first === "supabase-not-configured") {
        setStatus("not-configured");
        return;
      }
      if (first === "not-authenticated") {
        setStatus("idle");
        return;
      }
      setError(first);
      setStatus("error");
      return;
    }
    setStatus("synced");
  }, []);

  // Wire online/offline + auto-sync on sign-in.
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

    return () => {
      mountedRef.current = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run a sync whenever the signed-in user changes (login / token restore).
  useEffect(() => {
    if (!configured) return;
    if (user && readIsOnline()) {
      void syncData();
    } else if (!user) {
      setStatus("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, configured]);

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
