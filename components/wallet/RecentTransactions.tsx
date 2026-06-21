"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Fuel,
  Wrench,
  ShieldCheck,
  ParkingCircle,
  Droplets,
  Receipt,
  Trash2,
  Loader2,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { useOfflineDB } from "@/hooks/useOfflineDB";
import { isExpenseCategory } from "@/types/wallet";
import type { ExpenseCategory } from "@/types/wallet";
import type { Expense } from "@/types/db";
import type { TranslationKey } from "@/types/i18n";

interface RecentTransactionsProps {
  refreshKey: number;
}

const CATEGORY_ICON: Record<ExpenseCategory, LucideIcon> = {
  fuel: Fuel,
  maintenance: Wrench,
  insurance: ShieldCheck,
  parking: ParkingCircle,
  wash: Droplets,
  other: Receipt,
};

const CATEGORY_LABEL: Record<ExpenseCategory, TranslationKey> = {
  fuel: "categoryFuel",
  maintenance: "categoryMaintenance",
  insurance: "categoryInsurance",
  parking: "categoryParking",
  wash: "categoryWash",
  other: "categoryOther",
};

const VISIBLE_LIMIT = 8;

function normalize(category: string): ExpenseCategory {
  return isExpenseCategory(category) ? category : "other";
}

export function RecentTransactions({ refreshKey }: RecentTransactionsProps) {
  const { t, language } = useTranslation();
  const { get, remove } = useOfflineDB();
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [localTick, setLocalTick] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setHasError(false);
    const data = await get("expenses");
    const sorted = [...data].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    setItems(sorted);
    setLoading(false);
  }, [get]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setHasError(false);
    get("expenses")
      .then((data) => {
        if (!alive) return;
        const sorted = [...data].sort((a, b) =>
          b.date.localeCompare(a.date)
        );
        setItems(sorted);
      })
      .catch(() => {
        if (alive) setHasError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [get, refreshKey, localTick]);

  async function onDelete(id: number | undefined) {
    if (id == null) return;
    const ok = await remove("expenses", id);
    if (ok) {
      setLocalTick((n) => n + 1);
    } else {
      await reload();
    }
  }

  const visible = items.slice(0, VISIBLE_LIMIT);
  const dateFormatter = new Intl.DateTimeFormat(
    language === "ar" ? "ar" : language,
    { day: "2-digit", month: "short", year: "numeric" }
  );

  return (
    <section className="space-y-3 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950/70 p-5 shadow-lg backdrop-blur">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
          {t("recentTransactions")}
        </h2>
        <span className="rounded-full border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 px-2 py-0.5 text-[11px] text-slate-600 dark:text-gray-400">
          {items.length}
        </span>
      </header>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {t("loadingTransactions")}
        </div>
      )}

      {!loading && hasError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"
        >
          <AlertCircle className="h-4 w-4" aria-hidden />
          {t("transactionsError")}
        </div>
      )}

      {!loading && !hasError && visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-gray-800 px-4 py-6 text-center text-sm text-slate-600 dark:text-gray-500">
          {t("noTransactionsYet")}
        </div>
      )}

      <ul className="space-y-2">
        {visible.map((exp) => {
          const cat = normalize(exp.category);
          const Icon = CATEGORY_ICON[cat];
          return (
            <li
              key={exp.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-3 transition-colors hover:border-gray-700"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/10 text-blue-300">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900 dark:text-gray-100">
                  {t(CATEGORY_LABEL[cat])}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-gray-500">
                  {dateFormatter.format(new Date(exp.date))}
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-gray-100">
                {exp.amount.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => onDelete(exp.id)}
                aria-label={t("deleteAction")}
                className="rounded-xl p-2 text-slate-600 dark:text-gray-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 active:scale-95"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
