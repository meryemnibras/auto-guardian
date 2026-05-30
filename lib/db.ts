import Dexie, { Table } from "dexie";
import type {
  Chat,
  Diagnostic,
  Expense,
  FuelEntry,
  LocationRecord,
  MaintenanceLogEntry,
  TableEntityMap,
  TableName,
} from "@/types/db";

export class AutoGuardianDB extends Dexie {
  expenses!: Table<Expense, number>;
  diagnostics!: Table<Diagnostic, number>;
  location!: Table<LocationRecord, number>;
  chats!: Table<Chat, number>;
  maintenanceLog!: Table<MaintenanceLogEntry, number>;
  fuel!: Table<FuelEntry, number>;

  constructor() {
    super("AutoGuardianDB");

    // v1 — Phase 1 baseline (kept for existing installs).
    this.version(1).stores({
      expenses: "++id, category, date",
      diagnostics: "++id, date",
      location: "++id, timestamp",
    });

    // v2 — adds sync metadata + backfills isSynced=false on existing rows
    // so that they are picked up by the first cloud sync after upgrade.
    this.version(2)
      .stores({
        expenses: "++id, category, date, isSynced, syncedAt, cloudId",
        diagnostics: "++id, date, isSynced, syncedAt, cloudId",
        location: "++id, timestamp",
      })
      .upgrade(async (tx) => {
        await tx
          .table("expenses")
          .toCollection()
          .modify((rec: Expense) => {
            if (rec.isSynced === undefined) rec.isSynced = false;
          });
        await tx
          .table("diagnostics")
          .toCollection()
          .modify((rec: Diagnostic) => {
            if (rec.isSynced === undefined) rec.isSynced = false;
          });
      });

    // v3 — adds local-only chats table for AI Test Lab persistence.
    // No backfill needed; the table is new.
    this.version(3).stores({
      expenses: "++id, category, date, isSynced, syncedAt, cloudId",
      diagnostics: "++id, date, isSynced, syncedAt, cloudId",
      location: "++id, timestamp",
      chats: "++id, updatedAt",
    });

    // v4 — adds maintenance service log so gauges reflect real service history.
    this.version(4).stores({
      expenses: "++id, category, date, isSynced, syncedAt, cloudId",
      diagnostics: "++id, date, isSynced, syncedAt, cloudId",
      location: "++id, timestamp",
      chats: "++id, updatedAt",
      maintenanceLog: "++id, type, serviceKm, date",
    });

    // v5 — adds fuel log for trip and efficiency tracking.
    this.version(5).stores({
      expenses: "++id, category, date, isSynced, syncedAt, cloudId",
      diagnostics: "++id, date, isSynced, syncedAt, cloudId",
      location: "++id, timestamp",
      chats: "++id, updatedAt",
      maintenanceLog: "++id, type, serviceKm, date",
      fuel: "++id, odometerKm, date",
    });
  }
}

export const db = new AutoGuardianDB();

export function tableFor<T extends TableName>(
  name: T
): Table<TableEntityMap[T], number> {
  return db[name] as unknown as Table<TableEntityMap[T], number>;
}
