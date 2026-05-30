export type SyncStatus =
  | "idle"
  | "offline"
  | "syncing"
  | "synced"
  | "error"
  | "not-configured";

export interface SyncSummary {
  expensesSynced: number;
  diagnosticsSynced: number;
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
