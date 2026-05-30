export interface SyncFields {
  isSynced?: boolean;
  syncedAt?: string | null;
  cloudId?: string | null;
  syncError?: string | null;
}

export interface Expense extends SyncFields {
  id?: number;
  amount: number;
  category: string;
  date: string;
}

export interface Diagnostic extends SyncFields {
  id?: number;
  result: string;
  date: string;
}

export interface LocationRecord {
  id?: number;
  lat: number;
  lng: number;
  timestamp: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Chat {
  id?: number;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export type MaintenanceType = "oil" | "air" | "tires";

export interface MaintenanceLogEntry {
  id?: number;
  type: MaintenanceType;
  serviceKm: number;
  date: string;
  notes?: string;
}

export interface FuelEntry {
  id?: number;
  odometerKm: number;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  date: string;
  notes?: string;
}

export type TableName =
  | "expenses"
  | "diagnostics"
  | "location"
  | "chats"
  | "maintenanceLog"
  | "fuel";

export interface TableEntityMap {
  expenses: Expense;
  diagnostics: Diagnostic;
  location: LocationRecord;
  chats: Chat;
  maintenanceLog: MaintenanceLogEntry;
  fuel: FuelEntry;
}

export type SyncableTableName = "expenses" | "diagnostics";

export const SYNCABLE_TABLES: readonly SyncableTableName[] = [
  "expenses",
  "diagnostics",
] as const;

export function isSyncableTable(name: TableName): name is SyncableTableName {
  return name === "expenses" || name === "diagnostics";
}
