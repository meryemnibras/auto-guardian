export type SyncStatus =
  | "idle"
  | "offline"
  | "syncing"
  | "synced"
  | "error"
  | "not-configured";

export interface TableSyncCount {
  pushed: number;
  pulled: number;
}

export interface SyncSummary {
  /** Total rows uploaded to the cloud across all tables. */
  pushed: number;
  /** Total rows downloaded from the cloud across all tables. */
  pulled: number;
  /** Per-table breakdown keyed by Dexie table name. */
  perTable: Record<string, TableSyncCount>;
  errors: string[];
  lastSyncedAt: string | null;
}

export interface CloudSyncState {
  status: SyncStatus;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  summary: SyncSummary | null;
}
