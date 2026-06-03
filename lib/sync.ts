import type { Table } from "dexie";
import { db } from "./db";
import { isSupabaseConfigured, supabase } from "./supabaseClient";
import type {
  Diagnostic,
  Expense,
  FuelEntry,
  MaintenanceLogEntry,
  SyncFields,
} from "@/types/db";
import type { SyncSummary, TableSyncCount } from "@/types/sync";

// ---------------------------------------------------------------------------
// Generic two-way sync engine.
//
// For each syncable table we define how a local Dexie row maps to a cloud
// (Supabase) row and back. The engine then:
//   1. PUSH:  uploads every local row not yet marked isSynced, upserting by
//             (user_id, local_id) so re-runs never duplicate, then marks the
//             local row synced and records its cloud uuid.
//   2. PULL:  downloads every cloud row owned by the user and inserts any that
//             aren't already present locally (matched by cloud id) — this is
//             what restores history on a brand-new device or browser.
//
// Row Level Security on Supabase guarantees a user only ever sees their own
// rows, so PULL is automatically scoped to the signed-in user.
// ---------------------------------------------------------------------------

/** A cloud row always carries at least its uuid and the originating local id. */
interface CloudRowBase {
  id: string;
  local_id: number | null;
}

interface TableSync<Local extends SyncFields & { id?: number }, Cloud> {
  /** Dexie table name (used as the per-table summary key). */
  key: string;
  /** Supabase table name. */
  cloud: string;
  table: () => Table<Local, number>;
  /** Local row → cloud column payload (excluding user_id / local_id). */
  toCloud: (row: Local) => Record<string, unknown>;
  /** Cloud row → local column fields (excluding id / sync metadata). */
  fromCloud: (row: Cloud) => Omit<Local, "id" | keyof SyncFields>;
}

const EXPENSES: TableSync<Expense, CloudRowBase & Record<string, unknown>> = {
  key: "expenses",
  cloud: "expenses",
  table: () => db.expenses,
  toCloud: (r) => ({ amount: r.amount, category: r.category, date: r.date }),
  fromCloud: (c) => ({
    amount: Number(c.amount),
    category: String(c.category),
    date: String(c.date),
  }),
};

const DIAGNOSTICS: TableSync<
  Diagnostic,
  CloudRowBase & Record<string, unknown>
> = {
  key: "diagnostics",
  cloud: "diagnostics",
  table: () => db.diagnostics,
  toCloud: (r) => ({ result: r.result, date: r.date }),
  fromCloud: (c) => ({ result: String(c.result), date: String(c.date) }),
};

const FUEL: TableSync<FuelEntry, CloudRowBase & Record<string, unknown>> = {
  key: "fuel",
  cloud: "fuel",
  table: () => db.fuel,
  toCloud: (r) => ({
    odometer_km: r.odometerKm,
    liters: r.liters,
    cost_per_liter: r.costPerLiter,
    total_cost: r.totalCost,
    date: r.date,
    notes: r.notes ?? null,
  }),
  fromCloud: (c) => ({
    odometerKm: Number(c.odometer_km),
    liters: Number(c.liters),
    costPerLiter: Number(c.cost_per_liter),
    totalCost: Number(c.total_cost),
    date: String(c.date),
    notes: c.notes == null ? undefined : String(c.notes),
  }),
};

const MAINTENANCE: TableSync<
  MaintenanceLogEntry,
  CloudRowBase & Record<string, unknown>
> = {
  key: "maintenanceLog",
  cloud: "maintenance_log",
  table: () => db.maintenanceLog,
  toCloud: (r) => ({
    type: r.type,
    service_km: r.serviceKm,
    date: r.date,
    notes: r.notes ?? null,
  }),
  fromCloud: (c) => ({
    type: String(c.type) as MaintenanceLogEntry["type"],
    serviceKm: Number(c.service_km),
    date: String(c.date),
    notes: c.notes == null ? undefined : String(c.notes),
  }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SYNCS: TableSync<any, any>[] = [EXPENSES, DIAGNOSTICS, FUEL, MAINTENANCE];

function emptySummary(): SyncSummary {
  return {
    pushed: 0,
    pulled: 0,
    perTable: {},
    errors: [],
    lastSyncedAt: null,
  };
}

async function pushTable<L extends SyncFields & { id?: number }>(
  cfg: TableSync<L, CloudRowBase & Record<string, unknown>>,
  userId: string,
  now: string,
  count: TableSyncCount,
  errors: string[]
): Promise<void> {
  if (!supabase) return;
  const table = cfg.table();
  const pending = await table.filter((r) => r.isSynced !== true).toArray();
  if (pending.length === 0) return;

  const payload = pending.map((r) => ({
    user_id: userId,
    local_id: r.id ?? null,
    ...cfg.toCloud(r),
  }));

  const { data, error } = await supabase
    .from(cfg.cloud)
    .upsert(payload, { onConflict: "user_id,local_id" })
    .select("id, local_id");

  if (error) {
    errors.push(`${cfg.key} push: ${error.message}`);
    return;
  }

  const cloudByLocal = new Map<number, string>();
  for (const row of (data ?? []) as CloudRowBase[]) {
    if (row.local_id != null) cloudByLocal.set(row.local_id, row.id);
  }

  for (const rec of pending) {
    if (rec.id == null) continue;
    try {
      const patch: SyncFields = {
        isSynced: true,
        syncedAt: now,
        cloudId: cloudByLocal.get(rec.id) ?? rec.cloudId ?? null,
        syncError: null,
      };
      // Dexie's UpdateSpec generic is stricter than our SyncFields subset.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await table.update(rec.id, patch as any);
      count.pushed += 1;
    } catch (e) {
      errors.push(
        `${cfg.key} local-update id=${rec.id}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }
}

async function pullTable<L extends SyncFields & { id?: number }>(
  cfg: TableSync<L, CloudRowBase & Record<string, unknown>>,
  count: TableSyncCount,
  errors: string[]
): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase.from(cfg.cloud).select("*");
  if (error) {
    errors.push(`${cfg.key} pull: ${error.message}`);
    return;
  }
  const cloudRows = (data ?? []) as (CloudRowBase & Record<string, unknown>)[];
  if (cloudRows.length === 0) return;

  const table = cfg.table();
  const local = await table.toArray();
  const knownCloudIds = new Set(
    local.map((r) => r.cloudId).filter((v): v is string => Boolean(v))
  );

  for (const cloud of cloudRows) {
    if (knownCloudIds.has(cloud.id)) continue; // already have it locally
    try {
      await table.add({
        ...cfg.fromCloud(cloud),
        isSynced: true,
        syncedAt: new Date().toISOString(),
        cloudId: cloud.id,
        syncError: null,
      } as unknown as L);
      count.pulled += 1;
    } catch (e) {
      errors.push(
        `${cfg.key} local-insert cloud=${cloud.id}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }
}

/**
 * Runs a full two-way sync (push then pull) for the signed-in user.
 * Safe to call repeatedly — every step is idempotent.
 */
export async function syncLocalDataToCloud(): Promise<SyncSummary> {
  const summary = emptySummary();

  if (!isSupabaseConfigured || !supabase) {
    summary.errors.push("supabase-not-configured");
    return summary;
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    summary.errors.push("not-authenticated");
    return summary;
  }
  const userId = userData.user.id;
  const now = new Date().toISOString();

  for (const cfg of SYNCS) {
    const count: TableSyncCount = { pushed: 0, pulled: 0 };
    try {
      await pushTable(cfg, userId, now, count, summary.errors);
      await pullTable(cfg, count, summary.errors);
    } catch (e) {
      summary.errors.push(
        `${cfg.key}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
    summary.perTable[cfg.key] = count;
    summary.pushed += count.pushed;
    summary.pulled += count.pulled;
  }

  summary.lastSyncedAt = now;
  return summary;
}
