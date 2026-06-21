"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Fuel,
  Plus,
  Trash2,
  Loader2,
  TrendingDown,
  TrendingUp,
  Gauge as GaugeIcon,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/lib/db";
import type { FuelEntry } from "@/types/db";
import { useTranslation } from "@/components/LanguageProvider";

interface FuelLogProps {
  refreshKey?: number;
  onSaved?: () => void;
}

interface EfficiencyStats {
  count: number;
  totalKm: number;
  totalLiters: number;
  totalCost: number;
  avgLitersPer100Km: number | null;
  avgCostPer100Km: number | null;
  lastFill: FuelEntry | null;
  trend: "improving" | "worsening" | "stable" | null;
}

function computeStats(entries: readonly FuelEntry[]): EfficiencyStats {
  if (entries.length === 0) {
    return {
      count: 0,
      totalKm: 0,
      totalLiters: 0,
      totalCost: 0,
      avgLitersPer100Km: null,
      avgCostPer100Km: null,
      lastFill: null,
      trend: null,
    };
  }

  // Sort oldest → newest for delta math.
  const sorted = [...entries].sort((a, b) => a.odometerKm - b.odometerKm);

  let totalKm = 0;
  let totalLiters = 0;
  let totalCost = 0;

  // Per-segment l/100km using consecutive odometer deltas.
  const segments: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const km = sorted[i].odometerKm - sorted[i - 1].odometerKm;
    if (km > 0) {
      totalKm += km;
      totalLiters += sorted[i].liters;
      totalCost += sorted[i].totalCost;
      segments.push((sorted[i].liters / km) * 100);
    }
  }

  const avgLitersPer100Km =
    totalKm > 0 ? (totalLiters / totalKm) * 100 : null;
  const avgCostPer100Km =
    totalKm > 0 ? (totalCost / totalKm) * 100 : null;

  // Compare last segment to the running average of all previous segments.
  let trend: EfficiencyStats["trend"] = null;
  if (segments.length >= 3) {
    const last = segments[segments.length - 1];
    const prior =
      segments.slice(0, -1).reduce((s, n) => s + n, 0) /
      (segments.length - 1);
    const delta = last - prior;
    if (Math.abs(delta) < prior * 0.05) trend = "stable";
    else if (delta > 0) trend = "worsening";
    else trend = "improving";
  }

  return {
    count: entries.length,
    totalKm,
    totalLiters,
    totalCost,
    avgLitersPer100Km,
    avgCostPer100Km,
    lastFill: sorted[sorted.length - 1],
    trend,
  };
}

export function FuelLog({ refreshKey, onSaved }: FuelLogProps) {
  const { t, language } = useTranslation();
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [localTick, setLocalTick] = useState(0);

  const [odometer, setOdometer] = useState("");
  const [liters, setLiters] = useState("");
  const [costPerLiter, setCostPerLiter] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await db.fuel.toArray();
      setEntries(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey, localTick]);

  const stats = useMemo(() => computeStats(entries), [entries]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const odo = Number(odometer);
    const lit = Number(liters);
    const cpl = Number(costPerLiter);
    if (
      !Number.isFinite(odo) ||
      !Number.isFinite(lit) ||
      !Number.isFinite(cpl) ||
      odo <= 0 ||
      lit <= 0 ||
      cpl < 0
    ) {
      return;
    }
    setSaving(true);
    try {
      await db.fuel.add({
        odometerKm: Math.round(odo),
        liters: lit,
        costPerLiter: cpl,
        totalCost: Math.round(lit * cpl * 100) / 100,
        date: new Date().toISOString(),
      });
      setOdometer("");
      setLiters("");
      setCostPerLiter("");
      setLocalTick((n) => n + 1);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: number | undefined) {
    if (id == null) return;
    await db.fuel.delete(id);
    setLocalTick((n) => n + 1);
    onSaved?.();
  }

  const formatter = new Intl.DateTimeFormat(
    language === "ar" ? "ar" : language,
    { day: "2-digit", month: "short", year: "numeric" }
  );

  const sortedDesc = [...entries].sort((a, b) => b.odometerKm - a.odometerKm);
  const visible = sortedDesc.slice(0, 8);

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950/70 p-5 shadow-lg backdrop-blur">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-orange-300" aria-hidden />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
            {t("fuelLogTitle")}
          </h2>
        </div>
        <span className="rounded-full border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 px-2 py-0.5 text-[11px] text-slate-600 dark:text-gray-400">
          {entries.length}
        </span>
      </header>
      <p className="text-xs text-slate-600 dark:text-gray-400">{t("fuelLogIntro")}</p>

      {/* Efficiency summary */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-3 sm:grid-cols-4">
        <MetricCell
          icon={GaugeIcon}
          label={t("efficiencyLabel")}
          value={
            stats.avgLitersPer100Km != null
              ? `${stats.avgLitersPer100Km.toFixed(1)} L/100`
              : "—"
          }
          tone="orange"
        />
        <MetricCell
          icon={Fuel}
          label={t("totalLitersLabel")}
          value={stats.totalLiters > 0 ? stats.totalLiters.toFixed(1) : "—"}
          tone="blue"
        />
        <MetricCell
          icon={GaugeIcon}
          label={t("totalKmLabel")}
          value={stats.totalKm > 0 ? stats.totalKm.toLocaleString() : "—"}
          tone="violet"
        />
        <MetricCell
          icon={stats.trend === "improving" ? TrendingDown : TrendingUp}
          label={t("trendLabel")}
          value={
            stats.trend === "improving"
              ? t("trendImproving")
              : stats.trend === "worsening"
                ? t("trendWorsening")
                : stats.trend === "stable"
                  ? t("trendStable")
                  : "—"
          }
          tone={
            stats.trend === "improving"
              ? "emerald"
              : stats.trend === "worsening"
                ? "rose"
                : "cyan"
          }
        />
      </div>

      {/* Add form */}
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className="text-[11px] text-slate-600 dark:text-gray-400">
              {t("odometerKmLabel")}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="38800"
              required
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 px-3 text-sm text-slate-900 dark:text-gray-100 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
            />
          </label>
          <label className="block">
            <span className="text-[11px] text-slate-600 dark:text-gray-400">
              {t("litersLabel")}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={liters}
              onChange={(e) => setLiters(e.target.value)}
              placeholder="40.5"
              required
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 px-3 text-sm text-slate-900 dark:text-gray-100 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
            />
          </label>
          <label className="block">
            <span className="text-[11px] text-slate-600 dark:text-gray-400">
              {t("costPerLiterLabel")}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={costPerLiter}
              onChange={(e) => setCostPerLiter(e.target.value)}
              placeholder="2.18"
              required
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 px-3 text-sm text-slate-900 dark:text-gray-100 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="h-4 w-4" aria-hidden />
          )}
          {t("addFuelEntry")}
        </button>
      </form>

      {/* List */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-gray-800 px-4 py-6 text-center text-sm text-slate-600 dark:text-gray-500">
          {t("noFuelYet")}
        </div>
      )}

      <ul className="space-y-2">
        {visible.map((f) => (
          <li
            key={f.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-3"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-300">
              <Fuel className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900 dark:text-gray-100">
                {f.odometerKm.toLocaleString()} {t("kmUnit")} ·{" "}
                {f.liters.toFixed(1)} L
              </div>
              <div className="text-[11px] text-slate-600 dark:text-gray-500">
                {formatter.format(new Date(f.date))} ·{" "}
                {f.costPerLiter.toFixed(2)}/L
              </div>
            </div>
            <span className="text-sm font-bold text-orange-300">
              {f.totalCost.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => onDelete(f.id)}
              aria-label={t("deleteAction")}
              className="rounded-lg p-1.5 text-slate-600 dark:text-gray-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300 active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

const TONE_CLASSES: Record<string, string> = {
  orange: "text-orange-300 bg-orange-500/10",
  blue: "text-blue-300 bg-blue-500/10",
  violet: "text-violet-300 bg-violet-500/10",
  emerald: "text-emerald-300 bg-emerald-500/10",
  rose: "text-rose-300 bg-rose-500/10",
  cyan: "text-cyan-300 bg-cyan-500/10",
};

function MetricCell({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: keyof typeof TONE_CLASSES;
}) {
  const cls = TONE_CLASSES[tone] ?? TONE_CLASSES.cyan;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 p-2">
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${cls}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="truncate text-[9px] uppercase tracking-wider text-slate-600 dark:text-gray-500">
          {label}
        </div>
        <div className="truncate text-xs font-semibold text-slate-900 dark:text-gray-100">
          {value}
        </div>
      </div>
    </div>
  );
}
