"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { MaintenanceLogEntry, MaintenanceType } from "@/types/db";

interface UseMaintenanceLog {
  entries: MaintenanceLogEntry[];
  latestByType: Partial<Record<MaintenanceType, MaintenanceLogEntry>>;
  loading: boolean;
  refresh: () => Promise<void>;
  recordService: (
    type: MaintenanceType,
    serviceKm: number,
    notes?: string
  ) => Promise<number | null>;
  remove: (id: number) => Promise<boolean>;
}

function buildLatestMap(
  entries: MaintenanceLogEntry[]
): Partial<Record<MaintenanceType, MaintenanceLogEntry>> {
  const map: Partial<Record<MaintenanceType, MaintenanceLogEntry>> = {};
  for (const e of entries) {
    const existing = map[e.type];
    if (!existing || e.serviceKm > existing.serviceKm) {
      map[e.type] = e;
    }
  }
  return map;
}

export function useMaintenanceLog(): UseMaintenanceLog {
  const [entries, setEntries] = useState<MaintenanceLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await db.maintenanceLog.orderBy("date").reverse().toArray();
      setEntries(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordService = useCallback<UseMaintenanceLog["recordService"]>(
    async (type, serviceKm, notes) => {
      if (!Number.isFinite(serviceKm) || serviceKm < 0) return null;
      try {
        const id = await db.maintenanceLog.add({
          type,
          serviceKm: Math.round(serviceKm),
          date: new Date().toISOString(),
          notes: notes?.trim() || undefined,
        });
        await refresh();
        return id as number;
      } catch {
        return null;
      }
    },
    [refresh]
  );

  const remove = useCallback<UseMaintenanceLog["remove"]>(
    async (id) => {
      try {
        await db.maintenanceLog.delete(id);
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [refresh]
  );

  return {
    entries,
    latestByType: buildLatestMap(entries),
    loading,
    refresh,
    recordService,
    remove,
  };
}
