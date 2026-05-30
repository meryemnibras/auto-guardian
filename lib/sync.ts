import { db } from "./db";
import { isSupabaseConfigured, supabase } from "./supabaseClient";
import type { Diagnostic, Expense } from "@/types/db";
import type { SyncSummary } from "@/types/sync";

interface CloudExpenseRow {
  id: string;
  local_id: number | null;
}

interface CloudDiagnosticRow {
  id: string;
  local_id: number | null;
}

function emptySummary(): SyncSummary {
  return {
    expensesSynced: 0,
    diagnosticsSynced: 0,
    errors: [],
    lastSyncedAt: null,
  };
}

async function unsyncedExpenses(): Promise<Expense[]> {
  return db.expenses.filter((r) => r.isSynced !== true).toArray();
}

async function unsyncedDiagnostics(): Promise<Diagnostic[]> {
  return db.diagnostics.filter((r) => r.isSynced !== true).toArray();
}

async function pushExpenses(summary: SyncSummary, now: string): Promise<void> {
  if (!supabase) return;
  const pending = await unsyncedExpenses();
  if (pending.length === 0) return;

  const payload = pending.map((r) => ({
    local_id: r.id,
    amount: r.amount,
    category: r.category,
    date: r.date,
    // TODO: include user_id once auth is added.
  }));

  const { data, error } = await supabase
    .from("expenses")
    .upsert(payload, { onConflict: "local_id" })
    .select("id, local_id");

  if (error) {
    summary.errors.push(`expenses: ${error.message}`);
    return;
  }

  const cloudByLocal = new Map<number, string>();
  for (const row of (data ?? []) as CloudExpenseRow[]) {
    if (row.local_id != null) cloudByLocal.set(row.local_id, row.id);
  }

  let written = 0;
  for (const rec of pending) {
    if (rec.id == null) continue;
    try {
      await db.expenses.update(rec.id, {
        isSynced: true,
        syncedAt: now,
        cloudId: cloudByLocal.get(rec.id) ?? rec.cloudId ?? null,
        syncError: null,
      });
      written += 1;
    } catch (e) {
      // Cloud insert succeeded but local mark failed — log for visibility.
      // Next sync will hit upsert via local_id and remain idempotent.
      summary.errors.push(
        `expenses local-update id=${rec.id}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }
  summary.expensesSynced = written;
}

async function pushDiagnostics(summary: SyncSummary, now: string): Promise<void> {
  if (!supabase) return;
  const pending = await unsyncedDiagnostics();
  if (pending.length === 0) return;

  const payload = pending.map((r) => ({
    local_id: r.id,
    result: r.result,
    date: r.date,
    // TODO: include user_id once auth is added.
  }));

  const { data, error } = await supabase
    .from("diagnostics")
    .upsert(payload, { onConflict: "local_id" })
    .select("id, local_id");

  if (error) {
    summary.errors.push(`diagnostics: ${error.message}`);
    return;
  }

  const cloudByLocal = new Map<number, string>();
  for (const row of (data ?? []) as CloudDiagnosticRow[]) {
    if (row.local_id != null) cloudByLocal.set(row.local_id, row.id);
  }

  let written = 0;
  for (const rec of pending) {
    if (rec.id == null) continue;
    try {
      await db.diagnostics.update(rec.id, {
        isSynced: true,
        syncedAt: now,
        cloudId: cloudByLocal.get(rec.id) ?? rec.cloudId ?? null,
        syncError: null,
      });
      written += 1;
    } catch (e) {
      summary.errors.push(
        `diagnostics local-update id=${rec.id}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }
  summary.diagnosticsSynced = written;
}

export async function syncLocalDataToCloud(): Promise<SyncSummary> {
  const summary = emptySummary();

  if (!isSupabaseConfigured || !supabase) {
    summary.errors.push("supabase-not-configured");
    return summary;
  }

  const now = new Date().toISOString();

  // Each table runs in its own try/catch so one failure cannot block the other.
  try {
    await pushExpenses(summary, now);
  } catch (e) {
    summary.errors.push(
      `expenses: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  try {
    await pushDiagnostics(summary, now);
  } catch (e) {
    summary.errors.push(
      `diagnostics: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  summary.lastSyncedAt = now;
  return summary;
}
