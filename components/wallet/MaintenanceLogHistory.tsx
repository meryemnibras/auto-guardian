"use client";

import {
  Droplet,
  Wind,
  Disc,
  Trash2,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import type { MaintenanceLogEntry, MaintenanceType } from "@/types/db";
import type { TranslationKey } from "@/types/i18n";

interface MaintenanceLogHistoryProps {
  entries: readonly MaintenanceLogEntry[];
  loading: boolean;
  onDelete: (id: number) => Promise<boolean>;
}

const TYPE_META: Record<
  MaintenanceType,
  { Icon: LucideIcon; labelKey: TranslationKey; tone: string }
> = {
  oil: { Icon: Droplet, labelKey: "oilChange", tone: "text-blue-300" },
  air: { Icon: Wind, labelKey: "airFilter", tone: "text-violet-300" },
  tires: { Icon: Disc, labelKey: "tireInspection", tone: "text-cyan-300" },
};

export function MaintenanceLogHistory({
  entries,
  loading,
  onDelete,
}: MaintenanceLogHistoryProps) {
  const { t, language } = useTranslation();
  const formatter = new Intl.DateTimeFormat(language === "ar" ? "ar" : language, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-2 rounded-2xl border border-gray-800 bg-gray-900/60 p-3">
      <div className="text-[11px] uppercase tracking-wider text-gray-500">
        {t("serviceHistory")}
      </div>

      {loading && entries.length === 0 && (
        <div className="flex items-center justify-center py-4 text-xs text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-800 px-3 py-4 text-center text-xs text-gray-500">
          {t("noServiceLogged")}
        </div>
      )}

      <ul className="space-y-1.5">
        {entries.map((e) => {
          const meta = TYPE_META[e.type];
          const Icon = meta.Icon;
          return (
            <li
              key={e.id}
              className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-950/50 px-3 py-2 text-xs"
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.tone}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-100">
                  {t(meta.labelKey)}
                </div>
                <div className="text-[10px] text-gray-500">
                  {e.serviceKm.toLocaleString()} {t("kmUnit")} ·{" "}
                  {formatter.format(new Date(e.date))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => e.id != null && onDelete(e.id)}
                aria-label={t("deleteAction")}
                className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300 active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
