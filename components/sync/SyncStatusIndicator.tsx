"use client";

import { useTranslation } from "@/components/LanguageProvider";
import { useCloudSync } from "@/hooks/useCloudSync";
import type { SyncStatus } from "@/types/sync";
import type { TranslationKey } from "@/types/i18n";

interface DotStyle {
  dot: string;
  ring: string;
  text: string;
  labelKey: TranslationKey;
  pulse: boolean;
}

const STYLE: Record<SyncStatus, DotStyle> = {
  idle: {
    dot: "bg-slate-400",
    ring: "border-slate-700/60",
    text: "text-slate-300",
    labelKey: "syncIdle",
    pulse: false,
  },
  syncing: {
    dot: "bg-blue-400",
    ring: "border-blue-500/40",
    text: "text-blue-200",
    labelKey: "syncSyncing",
    pulse: true,
  },
  synced: {
    dot: "bg-emerald-400",
    ring: "border-emerald-500/40",
    text: "text-emerald-200",
    labelKey: "syncSynced",
    pulse: false,
  },
  offline: {
    dot: "bg-slate-500",
    ring: "border-slate-700/60",
    text: "text-slate-300",
    labelKey: "syncOffline",
    pulse: false,
  },
  "not-configured": {
    dot: "bg-amber-400",
    ring: "border-amber-500/40",
    text: "text-amber-200",
    labelKey: "syncNotConfigured",
    pulse: false,
  },
  error: {
    dot: "bg-rose-500",
    ring: "border-rose-500/40",
    text: "text-rose-200",
    labelKey: "syncError",
    pulse: false,
  },
};

export function SyncStatusIndicator() {
  const { t } = useTranslation();
  const { status, isOnline, syncData, isSyncing } = useCloudSync();
  const s = STYLE[status];

  const canTrigger =
    isOnline && status !== "not-configured" && status !== "offline" && !isSyncing;

  return (
    <button
      type="button"
      onClick={() => {
        if (canTrigger) void syncData();
      }}
      disabled={!canTrigger}
      aria-label={t("syncManualTrigger")}
      title={t(s.labelKey)}
      className={`fixed end-3 top-3 z-30 inline-flex items-center gap-2 rounded-full border bg-slate-950/80 px-3 py-1.5 text-xs backdrop-blur transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:cursor-default ${s.ring} ${s.text}`}
    >
      <span className="relative inline-flex">
        {s.pulse && (
          <span
            aria-hidden
            className={`absolute inset-0 inline-flex h-2 w-2 animate-ping rounded-full ${s.dot} opacity-75`}
          />
        )}
        <span
          aria-hidden
          className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`}
        />
      </span>
      <span>{t(s.labelKey)}</span>
    </button>
  );
}
