"use client";

import { useCallback, useEffect, useState } from "react";
import {
  History,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  Filter,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { useOfflineDB } from "@/hooks/useOfflineDB";
import type { Diagnostic } from "@/types/db";
import type { AcousticDiagnosisSeverity } from "@/types/mechanical";
import type { TranslationKey } from "@/types/i18n";

interface DiagnosticsHistoryProps {
  refreshKey: number;
}

interface ParsedDiagnostic {
  id?: number;
  title: string;
  severity: AcousticDiagnosisSeverity | "unknown";
  date: string;
}

const SEVERITY_META: Record<
  AcousticDiagnosisSeverity | "unknown",
  { Icon: LucideIcon; tone: string; chipBg: string; labelKey: TranslationKey }
> = {
  normal: {
    Icon: CheckCircle2,
    tone: "text-emerald-300",
    chipBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    labelKey: "severityNormal",
  },
  warning: {
    Icon: AlertTriangle,
    tone: "text-amber-300",
    chipBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    labelKey: "severityWarning",
  },
  critical: {
    Icon: OctagonAlert,
    tone: "text-rose-300",
    chipBg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    labelKey: "severityCritical",
  },
  unknown: {
    Icon: AlertCircle,
    tone: "text-gray-400",
    chipBg: "bg-gray-500/15 text-gray-300 border-gray-500/30",
    labelKey: "diagHistoryUnknown",
  },
};

type SeverityFilter = "all" | AcousticDiagnosisSeverity;

const FILTER_OPTIONS: { value: SeverityFilter; labelKey: TranslationKey }[] = [
  { value: "all", labelKey: "diagHistoryFilterAll" },
  { value: "normal", labelKey: "severityNormal" },
  { value: "warning", labelKey: "severityWarning" },
  { value: "critical", labelKey: "severityCritical" },
];

const VISIBLE_LIMIT = 25;

function parseDiagnostic(d: Diagnostic): ParsedDiagnostic {
  // Saved format from Phase 2: "{title} — {severity}".
  // Older records may just have a free-form result string.
  const raw = (d.result ?? "").trim();
  const splitIdx = raw.lastIndexOf(" — ");
  if (splitIdx > 0) {
    const title = raw.slice(0, splitIdx).trim();
    const tail = raw.slice(splitIdx + 3).trim().toLowerCase();
    const severity: AcousticDiagnosisSeverity | "unknown" =
      tail === "normal" || tail === "warning" || tail === "critical"
        ? tail
        : "unknown";
    return { id: d.id, title, severity, date: d.date };
  }
  return { id: d.id, title: raw || "—", severity: "unknown", date: d.date };
}

export function DiagnosticsHistory({ refreshKey }: DiagnosticsHistoryProps) {
  const { t, language } = useTranslation();
  const { get, remove } = useOfflineDB();
  const [items, setItems] = useState<ParsedDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [localTick, setLocalTick] = useState(0);
  const [filter, setFilter] = useState<SeverityFilter>("all");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    get("diagnostics")
      .then((rows) => {
        if (!alive) return;
        const sorted = [...rows]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map(parseDiagnostic);
        setItems(sorted);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [get, refreshKey, localTick]);

  const onDelete = useCallback(
    async (id: number | undefined) => {
      if (id == null) return;
      await remove("diagnostics", id);
      setLocalTick((n) => n + 1);
    },
    [remove]
  );

  const formatter = new Intl.DateTimeFormat(language === "ar" ? "ar" : language, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const filtered = filter === "all" ? items : items.filter((i) => i.severity === filter);
  const visible = filtered.slice(0, VISIBLE_LIMIT);

  return (
    <section className="space-y-3 rounded-2xl border border-gray-800 bg-gray-900/60 p-5 shadow-lg">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-300" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-100">
            {t("diagHistoryTitle")}
          </h2>
          <span className="rounded-full border border-gray-800 bg-gray-950 px-2 py-0.5 text-[11px] text-gray-400">
            {items.length}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-gray-800 bg-gray-950 p-1">
          <Filter className="ms-1 h-3 w-3 text-gray-500" aria-hidden />
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter(opt.value)}
                aria-pressed={active}
                className={`rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? "bg-blue-500/20 text-blue-200"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
      </header>

      <p className="text-xs text-gray-400">{t("diagHistoryIntro")}</p>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {t("loadingTransactions")}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-800 px-4 py-6 text-center text-sm text-gray-500">
          {items.length === 0
            ? t("diagHistoryEmpty")
            : t("diagHistoryFilterEmpty")}
        </div>
      )}

      <ul className="space-y-2">
        {visible.map((d) => {
          const meta = SEVERITY_META[d.severity];
          const Icon = meta.Icon;
          return (
            <li
              key={d.id}
              className="flex items-start gap-3 rounded-2xl border border-gray-800 bg-gray-950/50 p-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gray-900">
                <Icon className={`h-4 w-4 ${meta.tone}`} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    dir="auto"
                    className="text-sm font-semibold text-gray-100"
                  >
                    {d.title}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.chipBg}`}
                  >
                    {t(meta.labelKey)}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-gray-500">
                  {formatter.format(new Date(d.date))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDelete(d.id)}
                aria-label={t("deleteAction")}
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300 active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      {filtered.length > VISIBLE_LIMIT && (
        <div className="text-center text-[10px] text-gray-500">
          {t("diagHistoryLimited").replace(
            "{count}",
            String(filtered.length - VISIBLE_LIMIT)
          )}
        </div>
      )}
    </section>
  );
}
