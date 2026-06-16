"use client";

import { Languages } from "lucide-react";
import { useTranslation } from "./LanguageProvider";

/**
 * Quick Arabic ⇄ English switch for the customer. French stays available in
 * Settings; this button only flips between the two primary languages. The
 * label shows the language you'll switch TO so the action is obvious.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useTranslation();
  const target = language === "ar" ? "en" : "ar";
  const targetLabel = target === "ar" ? "ع" : "EN";

  return (
    <button
      type="button"
      onClick={() => setLanguage(target)}
      aria-label={target === "ar" ? "التبديل إلى العربية" : "Switch to English"}
      title={target === "ar" ? "العربية" : "English"}
      className={`inline-flex h-10 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 ${className}`}
    >
      <Languages className="h-4 w-4 text-sky-500 dark:text-sky-400" aria-hidden />
      {targetLabel}
    </button>
  );
}
