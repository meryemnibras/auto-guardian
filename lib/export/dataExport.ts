import { db } from "@/lib/db";
import type {
  Chat,
  Diagnostic,
  Expense,
  FuelEntry,
  LocationRecord,
  MaintenanceLogEntry,
} from "@/types/db";

/**
 * Client-side data export utilities. No server calls — all reads come from
 * IndexedDB via the same Dexie instance the rest of the app uses.
 */

export interface FullBackup {
  format: "auto-guardian-backup";
  version: 3;
  exportedAt: string;
  counts: {
    expenses: number;
    diagnostics: number;
    location: number;
    chats: number;
    maintenanceLog: number;
    fuel: number;
  };
  data: {
    expenses: Expense[];
    diagnostics: Diagnostic[];
    location: LocationRecord[];
    chats: Chat[];
    maintenanceLog: MaintenanceLogEntry[];
    fuel: FuelEntry[];
  };
}

export async function buildFullBackup(): Promise<FullBackup> {
  const [expenses, diagnostics, location, chats, maintenanceLog, fuel] =
    await Promise.all([
      db.expenses.toArray(),
      db.diagnostics.toArray(),
      db.location.toArray(),
      db.chats.toArray(),
      db.maintenanceLog.toArray(),
      db.fuel.toArray(),
    ]);
  return {
    format: "auto-guardian-backup",
    version: 3,
    exportedAt: new Date().toISOString(),
    counts: {
      expenses: expenses.length,
      diagnostics: diagnostics.length,
      location: location.length,
      chats: chats.length,
      maintenanceLog: maintenanceLog.length,
      fuel: fuel.length,
    },
    data: { expenses, diagnostics, location, chats, maintenanceLog, fuel },
  };
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : JSON.stringify(value);
  // Wrap in quotes and double internal quotes — RFC 4180.
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function toCsv<T>(
  rows: readonly T[],
  columns: readonly (keyof T)[]
): string {
  const header = columns.map((c) => escapeCsvCell(String(c))).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(row[c])).join(",")
  );
  // BOM so Excel opens UTF-8 (Arabic) correctly.
  return "﻿" + [header, ...lines].join("\r\n");
}

export async function buildExpensesCsv(): Promise<string> {
  const rows = await db.expenses.toArray();
  return toCsv(rows, ["id", "amount", "category", "date", "isSynced", "cloudId"]);
}

export async function buildDiagnosticsCsv(): Promise<string> {
  const rows = await db.diagnostics.toArray();
  return toCsv(rows, ["id", "result", "date", "isSynced", "cloudId"]);
}

export async function buildLocationsCsv(): Promise<string> {
  const rows = await db.location.toArray();
  return toCsv(rows, ["id", "lat", "lng", "timestamp"]);
}

export function downloadBlob(content: string, filename: string, mime: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so Firefox/Safari finish the download trigger.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function timestampedFilename(prefix: string, ext: string): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${prefix}-${ts}.${ext}`;
}

export interface StorageCounts {
  expenses: number;
  diagnostics: number;
  location: number;
  chats: number;
  maintenanceLog: number;
  fuel: number;
}

export async function countAll(): Promise<StorageCounts> {
  const [expenses, diagnostics, location, chats, maintenanceLog, fuel] =
    await Promise.all([
      db.expenses.count(),
      db.diagnostics.count(),
      db.location.count(),
      db.chats.count(),
      db.maintenanceLog.count(),
      db.fuel.count(),
    ]);
  return { expenses, diagnostics, location, chats, maintenanceLog, fuel };
}

export async function clearAll(): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.expenses,
      db.diagnostics,
      db.location,
      db.chats,
      db.maintenanceLog,
      db.fuel,
    ],
    async () => {
      await db.expenses.clear();
      await db.diagnostics.clear();
      await db.location.clear();
      await db.chats.clear();
      await db.maintenanceLog.clear();
      await db.fuel.clear();
    }
  );
}

// ---------------------------------------------------------------------------
// Restore
// ---------------------------------------------------------------------------

export type RestoreMode = "merge" | "replace";

export interface RestoreResult {
  ok: boolean;
  inserted: StorageCounts;
  errors: string[];
}

interface BackupShape {
  format?: string;
  version?: number;
  data?: Partial<{
    expenses: unknown[];
    diagnostics: unknown[];
    location: unknown[];
    chats: unknown[];
    maintenanceLog: unknown[];
    fuel: unknown[];
  }>;
}

function emptyCounts(): StorageCounts {
  return {
    expenses: 0,
    diagnostics: 0,
    location: 0,
    chats: 0,
    maintenanceLog: 0,
    fuel: 0,
  };
}

function stripId<T extends { id?: number }>(rows: readonly T[]): T[] {
  return rows.map(({ id: _id, ...rest }) => rest as T);
}

function isExpense(v: unknown): v is Expense {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.amount === "number" &&
    typeof o.category === "string" &&
    typeof o.date === "string"
  );
}

function isDiagnostic(v: unknown): v is Diagnostic {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.result === "string" && typeof o.date === "string";
}

function isLocationRecord(v: unknown): v is LocationRecord {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.lat === "number" &&
    typeof o.lng === "number" &&
    typeof o.timestamp === "number"
  );
}

function isChat(v: unknown): v is Chat {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.title === "string" &&
    Array.isArray(o.messages) &&
    typeof o.createdAt === "number" &&
    typeof o.updatedAt === "number"
  );
}

function isMaintenanceEntry(v: unknown): v is MaintenanceLogEntry {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    (o.type === "oil" || o.type === "air" || o.type === "tires") &&
    typeof o.serviceKm === "number" &&
    typeof o.date === "string"
  );
}

function isFuelEntry(v: unknown): v is FuelEntry {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.odometerKm === "number" &&
    typeof o.liters === "number" &&
    typeof o.costPerLiter === "number" &&
    typeof o.totalCost === "number" &&
    typeof o.date === "string"
  );
}

export function parseBackup(raw: string): BackupShape | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as BackupShape;
  } catch {
    return null;
  }
}

export async function restoreBackup(
  raw: string,
  mode: RestoreMode = "merge"
): Promise<RestoreResult> {
  const result: RestoreResult = {
    ok: false,
    inserted: emptyCounts(),
    errors: [],
  };

  const backup = parseBackup(raw);
  if (!backup) {
    result.errors.push("invalid-json");
    return result;
  }

  if (backup.format !== "auto-guardian-backup") {
    result.errors.push("unknown-format");
    return result;
  }

  const data = backup.data ?? {};

  try {
    await db.transaction(
      "rw",
      [
        db.expenses,
        db.diagnostics,
        db.location,
        db.chats,
        db.maintenanceLog,
        db.fuel,
      ],
      async () => {
        if (mode === "replace") {
          await db.expenses.clear();
          await db.diagnostics.clear();
          await db.location.clear();
          await db.chats.clear();
          await db.maintenanceLog.clear();
          await db.fuel.clear();
        }

        const expenses = (data.expenses ?? []).filter(isExpense);
        if (expenses.length > 0) {
          await db.expenses.bulkAdd(stripId(expenses));
          result.inserted.expenses = expenses.length;
        }

        const diagnostics = (data.diagnostics ?? []).filter(isDiagnostic);
        if (diagnostics.length > 0) {
          await db.diagnostics.bulkAdd(stripId(diagnostics));
          result.inserted.diagnostics = diagnostics.length;
        }

        const location = (data.location ?? []).filter(isLocationRecord);
        if (location.length > 0) {
          await db.location.bulkAdd(stripId(location));
          result.inserted.location = location.length;
        }

        const chats = (data.chats ?? []).filter(isChat);
        if (chats.length > 0) {
          await db.chats.bulkAdd(stripId(chats));
          result.inserted.chats = chats.length;
        }

        const maintenanceLog = (data.maintenanceLog ?? []).filter(
          isMaintenanceEntry
        );
        if (maintenanceLog.length > 0) {
          await db.maintenanceLog.bulkAdd(stripId(maintenanceLog));
          result.inserted.maintenanceLog = maintenanceLog.length;
        }

        const fuel = (data.fuel ?? []).filter(isFuelEntry);
        if (fuel.length > 0) {
          await db.fuel.bulkAdd(stripId(fuel));
          result.inserted.fuel = fuel.length;
        }
      }
    );
    result.ok = true;
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : String(e));
  }

  return result;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("read-failed"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("read-failed"));
    reader.readAsText(file);
  });
}
