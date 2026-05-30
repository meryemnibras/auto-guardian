"use client";

import { useCallback, useMemo, useState } from "react";
import { Gauge, History, Wrench, Loader2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { useMaintenanceLog } from "@/hooks/useMaintenanceLog";
import {
  DEFAULT_CURRENT_KM,
  DEFAULT_MAINTENANCE,
  calculateMaintenanceProgress,
} from "@/lib/maintenance";
import type { MaintenanceItem } from "@/types/wallet";
import type { MaintenanceType } from "@/types/db";
import { CircularProgressCard } from "./CircularProgressCard";
import { MaintenanceLogHistory } from "./MaintenanceLogHistory";

export function MaintenanceCountdowns() {
  const { t, language } = useTranslation();
  const log = useMaintenanceLog();
  const [currentKmInput, setCurrentKmInput] = useState<string>(
    String(DEFAULT_CURRENT_KM)
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busyType, setBusyType] = useState<MaintenanceType | null>(null);

  const currentKm = useMemo(() => {
    const parsed = Number.parseInt(currentKmInput, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }, [currentKmInput]);

  const items = useMemo<MaintenanceItem[]>(
    () =>
      DEFAULT_MAINTENANCE.map((cfg) => {
        // Prefer real service log entry; fall back to hardcoded default.
        const logged = log.latestByType[cfg.id];
        const lastServiceKm = logged ? logged.serviceKm : cfg.lastServiceKm;
        const { remainingKm, progress } = calculateMaintenanceProgress(
          currentKm,
          lastServiceKm,
          cfg.intervalKm
        );
        return {
          id: cfg.id,
          title: t(cfg.titleKey),
          currentKm,
          targetKm: lastServiceKm + cfg.intervalKm,
          intervalKm: cfg.intervalKm,
          remainingKm,
          progress,
          accent: cfg.accent,
        };
      }),
    [currentKm, t, log.latestByType]
  );

  const markDone = useCallback(
    async (type: MaintenanceType) => {
      if (busyType) return;
      setBusyType(type);
      try {
        await log.recordService(type, currentKm);
      } finally {
        setBusyType(null);
      }
    },
    [currentKm, log, busyType]
  );

  const formatter = new Intl.DateTimeFormat(language === "ar" ? "ar" : language, {
    day: "2-digit",
    month: "short",
  });

  return (
    <section className="space-y-4 rounded-3xl border border-gray-800 bg-gray-950/70 p-5 shadow-lg backdrop-blur">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-blue-300" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-100">
            {t("maintenanceCountdowns")}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setHistoryOpen((s) => !s)}
          aria-pressed={historyOpen}
          className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] transition-colors active:scale-95 ${
            historyOpen
              ? "border-blue-500/40 bg-blue-500/10 text-blue-200"
              : "border-gray-800 bg-gray-900 text-gray-400 hover:text-gray-200"
          }`}
        >
          <History className="h-3.5 w-3.5" aria-hidden />
          {t("serviceHistory")}
          {log.entries.length > 0 && (
            <span className="ms-1 rounded-full bg-gray-950 px-1.5 text-[10px] text-gray-300">
              {log.entries.length}
            </span>
          )}
        </button>
      </header>

      <label className="block">
        <span className="text-xs text-gray-400">{t("currentKmLabel")}</span>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="100"
            value={currentKmInput}
            onChange={(e) => setCurrentKmInput(e.target.value)}
            className="h-12 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 text-base text-gray-100 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
          <span className="text-sm text-gray-400">{t("kmUnit")}</span>
        </div>
      </label>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {items.map((item) => {
          const logged = log.latestByType[item.id as MaintenanceType];
          return (
            <div key={item.id} className="flex flex-col gap-2">
              <CircularProgressCard
                title={item.title}
                remainingKm={item.remainingKm}
                progress={item.progress}
                accent={item.accent}
              />
              <button
                type="button"
                onClick={() => markDone(item.id as MaintenanceType)}
                disabled={busyType !== null}
                className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-gray-800 bg-gray-900 px-2 py-1.5 text-[10px] font-medium text-gray-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-300 active:scale-95 disabled:opacity-50"
              >
                {busyType === item.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                ) : (
                  <Wrench className="h-3 w-3" aria-hidden />
                )}
                {t("markServiceDone")}
              </button>
              {logged && (
                <div className="text-center text-[9px] text-gray-500">
                  {t("lastServiceAt")} ·{" "}
                  {logged.serviceKm.toLocaleString()} {t("kmUnit")} ·{" "}
                  {formatter.format(new Date(logged.date))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {historyOpen && (
        <MaintenanceLogHistory
          entries={log.entries}
          loading={log.loading}
          onDelete={log.remove}
        />
      )}
    </section>
  );
}
