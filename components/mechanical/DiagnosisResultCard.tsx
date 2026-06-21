"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import type {
  AcousticDiagnosisResult,
  AcousticDiagnosisSeverity,
} from "@/types/mechanical";
import type { TranslationKey } from "@/types/i18n";

interface SeverityStyle {
  ring: string;
  bg: string;
  badge: string;
  icon: string;
  Icon: LucideIcon;
  labelKey: TranslationKey;
}

const STYLES: Record<AcousticDiagnosisSeverity, SeverityStyle> = {
  normal: {
    ring: "ring-emerald-500/30",
    bg: "from-emerald-500/10 to-emerald-500/0",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: "text-emerald-300",
    Icon: CheckCircle2,
    labelKey: "severityNormal",
  },
  warning: {
    ring: "ring-amber-500/30",
    bg: "from-amber-500/10 to-amber-500/0",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: "text-amber-300",
    Icon: AlertTriangle,
    labelKey: "severityWarning",
  },
  critical: {
    ring: "ring-rose-500/30",
    bg: "from-rose-500/10 to-rose-500/0",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: "text-rose-300",
    Icon: OctagonAlert,
    labelKey: "severityCritical",
  },
};

interface DiagnosisResultCardProps {
  result: AcousticDiagnosisResult;
  saved: boolean | null;
}

export function DiagnosisResultCard({ result, saved }: DiagnosisResultCardProps) {
  const { t } = useTranslation();
  const style = STYLES[result.severity];
  const Icon = style.Icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-800 bg-gradient-to-br ${style.bg} bg-gray-900/80 p-5 ring-1 ${style.ring} shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 rounded-xl bg-white dark:bg-gray-950/60 p-2 ${style.icon}`}>
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-gray-100">
              {result.title}
            </h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.badge}`}
            >
              {t(style.labelKey)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-gray-300">
            {result.description}
          </p>
          <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-gray-950/50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-gray-400">
              {t("recommendation")}
            </div>
            <p className="mt-1 text-sm text-slate-800 dark:text-gray-200">{result.recommendation}</p>
          </div>
          {saved !== null && (
            <p
              className={`text-[11px] ${
                saved ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {saved ? t("savedLocally") : t("saveFailed")}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
