"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import type { MaintenanceAccent } from "@/types/wallet";

interface CircularProgressCardProps {
  title: string;
  remainingKm: number;
  progress: number;
  accent: MaintenanceAccent;
}

interface AccentStyle {
  stroke: string;
  text: string;
  track: string;
  ring: string;
  chipBg: string;
  chipText: string;
}

const ACCENTS: Record<MaintenanceAccent, AccentStyle> = {
  blue: {
    stroke: "stroke-blue-400",
    text: "text-blue-300",
    track: "stroke-blue-500/10",
    ring: "ring-blue-500/20",
    chipBg: "bg-blue-500/15",
    chipText: "text-blue-300",
  },
  violet: {
    stroke: "stroke-violet-400",
    text: "text-violet-300",
    track: "stroke-violet-500/10",
    ring: "ring-violet-500/20",
    chipBg: "bg-violet-500/15",
    chipText: "text-violet-300",
  },
  cyan: {
    stroke: "stroke-cyan-400",
    text: "text-cyan-300",
    track: "stroke-cyan-500/10",
    ring: "ring-cyan-500/20",
    chipBg: "bg-cyan-500/15",
    chipText: "text-cyan-300",
  },
  emerald: {
    stroke: "stroke-emerald-400",
    text: "text-emerald-300",
    track: "stroke-emerald-500/10",
    ring: "ring-emerald-500/20",
    chipBg: "bg-emerald-500/15",
    chipText: "text-emerald-300",
  },
  amber: {
    stroke: "stroke-amber-400",
    text: "text-amber-300",
    track: "stroke-amber-500/10",
    ring: "ring-amber-500/30",
    chipBg: "bg-amber-500/15",
    chipText: "text-amber-300",
  },
};

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularProgressCard({
  title,
  remainingKm,
  progress,
  accent,
}: CircularProgressCardProps) {
  const { t } = useTranslation();
  const baseStyle = ACCENTS[accent];
  const isDue = remainingKm <= 0;
  const isWarning = !isDue && progress >= 80;

  // When due → amber accent overrides; when warning → keep accent but show subtle alert.
  const style = isDue ? ACCENTS.amber : baseStyle;
  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <div
      className={`group flex flex-col items-center gap-3 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950/70 p-4 ring-1 ${style.ring} backdrop-blur transition-all active:scale-[0.98]`}
    >
      <div className="relative h-24 w-24 sm:h-28 sm:w-28">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full -rotate-90"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            className={style.track}
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={`${style.stroke} transition-[stroke-dashoffset] duration-700 ease-out`}
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: dashOffset,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isDue ? (
            <AlertTriangle
              className={`h-8 w-8 ${style.text} drop-shadow`}
              aria-hidden
            />
          ) : (
            <>
              <span
                className={`text-xl font-extrabold leading-none sm:text-2xl ${style.text}`}
              >
                {Math.round(remainingKm).toLocaleString()}
              </span>
              <span className="mt-1 text-[9px] uppercase tracking-wider text-slate-600 dark:text-gray-500">
                {t("kmUnit")}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="w-full min-w-0 text-center">
        <div className="truncate text-sm font-semibold text-slate-900 dark:text-gray-100">
          {title}
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-1">
          {isDue ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full ${style.chipBg} px-2 py-0.5 text-[10px] font-semibold ${style.chipText}`}
            >
              <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
              {t("serviceDueNow")}
            </span>
          ) : isWarning ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full ${style.chipBg} px-2 py-0.5 text-[10px] font-semibold ${style.chipText}`}
            >
              {Math.round(progress)}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 dark:text-gray-500">
              <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />
              {Math.round(progress)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
