"use client";

import { useCallback, useRef, useState } from "react";
import { tableFor } from "@/lib/db";
import {
  isSyncableTable,
  type TableEntityMap,
  type TableName,
} from "@/types/db";

export interface UseOfflineDB {
  add: <T extends TableName>(
    table: T,
    item: Omit<TableEntityMap[T], "id">
  ) => Promise<number | null>;
  get: <T extends TableName>(table: T) => Promise<TableEntityMap[T][]>;
  remove: <T extends TableName>(table: T, id: number) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
}

function withSyncDefaults<T extends TableName>(
  table: T,
  item: Omit<TableEntityMap[T], "id">
): Omit<TableEntityMap[T], "id"> {
  if (!isSyncableTable(table)) return item;
  const candidate = item as { isSynced?: boolean };
  if (candidate.isSynced === undefined) {
    return { ...item, isSynced: false } as Omit<TableEntityMap[T], "id">;
  }
  return item;
}

export function useOfflineDB(): UseOfflineDB {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const pending = useRef(0);

  const run = useCallback(
    async <R>(op: () => Promise<R>, fallback: R): Promise<R> => {
      pending.current += 1;
      setLoading(true);
      setError(null);
      try {
        return await op();
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        return fallback;
      } finally {
        pending.current = Math.max(0, pending.current - 1);
        if (pending.current === 0) setLoading(false);
      }
    },
    []
  );

  const add: UseOfflineDB["add"] = useCallback(
    (table, item) =>
      run(async () => {
        const payload = withSyncDefaults(table, item);
        const id = await tableFor(table).add(payload as never);
        return id as number;
      }, null),
    [run]
  );

  const get: UseOfflineDB["get"] = useCallback(
    <T extends TableName>(table: T) =>
      run(() => tableFor(table).toArray(), [] as TableEntityMap[T][]),
    [run]
  );

  const remove: UseOfflineDB["remove"] = useCallback(
    (table, id) =>
      run(async () => {
        await tableFor(table).delete(id);
        return true;
      }, false),
    [run]
  );

  return { add, get, remove, loading, error };
}
