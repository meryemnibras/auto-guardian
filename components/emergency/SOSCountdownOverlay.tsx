"use client";

import { Siren, X } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";

interface SOSCountdownOverlayProps {
  remainingSeconds: number;
  onCancel: () => void;
}

export function SOSCountdownOverlay({
  remainingSeconds,
  onCancel,
}: SOSCountdownOverlayProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={t("sosAlarmTitle")}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between gap-6 bg-gradient-to-b from-red-950 via-red-900 to-red-950 px-6 py-10 text-white"
    >
      <div className="flex items-center gap-3">
        <Siren className="h-7 w-7 animate-pulse text-red-200" aria-hidden />
        <h2 className="text-2xl font-extrabold tracking-tight">
          {t("sosAlarmTitle")}
        </h2>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <span
          aria-hidden
          className="absolute h-64 w-64 animate-ping rounded-full bg-red-500/30"
        />
        <span
          aria-hidden
          className="absolute h-48 w-48 rounded-full bg-red-500/20 blur-2xl"
        />
        <div className="relative grid h-48 w-48 place-items-center rounded-full border-4 border-red-300/60 bg-red-950/60 shadow-[0_20px_60px_-10px_rgba(248,113,113,0.7)]">
          <span
            aria-live="polite"
            className="text-7xl font-black tabular-nums"
          >
            {remainingSeconds}
          </span>
          <span className="mt-1 text-xs uppercase tracking-[0.3em] text-red-200/80">
            {t("secondsUnit")}
          </span>
        </div>
      </div>

      <p className="max-w-xs text-center text-sm text-red-100/90">
        {t("sosAlarmDescription")}
      </p>

      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-16 w-full max-w-sm items-center justify-center gap-3 rounded-3xl bg-white text-lg font-extrabold text-red-700 shadow-[0_12px_40px_-10px_rgba(255,255,255,0.6)] transition-transform active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-white/40"
      >
        <X className="h-6 w-6" aria-hidden />
        {t("cancelAlarm")}
      </button>
    </div>
  );
}
