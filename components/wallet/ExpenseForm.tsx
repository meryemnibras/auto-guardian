"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Plus, Loader2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { useOfflineDB } from "@/hooks/useOfflineDB";
import { EXPENSE_CATEGORIES } from "@/types/wallet";
import type { ExpenseCategory } from "@/types/wallet";
import type { TranslationKey } from "@/types/i18n";

const CATEGORY_LABEL: Record<ExpenseCategory, TranslationKey> = {
  fuel: "categoryFuel",
  maintenance: "categoryMaintenance",
  insurance: "categoryInsurance",
  parking: "categoryParking",
  wash: "categoryWash",
  other: "categoryOther",
};

interface ExpenseFormProps {
  scannedAmount: number | null;
  onSaved: () => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseForm({ scannedAmount, onSaved }: ExpenseFormProps) {
  const { t } = useTranslation();
  const { add, loading } = useOfflineDB();

  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<ExpenseCategory>("fuel");
  const [date, setDate] = useState<string>(todayISO());
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [successKey, setSuccessKey] = useState<TranslationKey | null>(null);

  useEffect(() => {
    if (scannedAmount !== null && scannedAmount > 0) {
      setAmount(scannedAmount.toFixed(2));
    }
  }, [scannedAmount]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorKey(null);
    setSuccessKey(null);

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setErrorKey("invalidAmount");
      return;
    }
    if (!date) {
      setErrorKey("invalidAmount");
      return;
    }

    const id = await add("expenses", {
      amount: value,
      category,
      date: new Date(date).toISOString(),
    });

    if (id === null) {
      setErrorKey("saveExpenseFailed");
      return;
    }

    setAmount("");
    setDate(todayISO());
    setSuccessKey("expenseSaved");
    onSaved();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950/70 p-5 shadow-lg backdrop-blur"
    >
      <label className="block">
        <span className="text-xs text-slate-600 dark:text-gray-400">{t("amountLabel")}</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
          className="mt-1 h-12 w-full rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 px-4 text-lg font-semibold text-slate-900 dark:text-gray-100 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-slate-600 dark:text-gray-400">{t("categoryLabel")}</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="mt-1 h-12 w-full rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 px-3 text-sm text-slate-900 dark:text-gray-100 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(CATEGORY_LABEL[c])}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-slate-600 dark:text-gray-400">{t("dateLabel")}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 h-12 w-full rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 px-3 text-sm text-slate-900 dark:text-gray-100 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)] transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Plus className="h-4 w-4" aria-hidden />
        )}
        {t("addExpense")}
      </button>

      {errorKey && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{t(errorKey)}</span>
        </div>
      )}

      {successKey && !errorKey && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{t(successKey)}</span>
        </div>
      )}
    </form>
  );
}
