"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "./LanguageProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t("lightMode") : t("darkMode")}
      title={isDark ? t("lightMode") : t("darkMode")}
      className={`grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 ${className}`}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-400" aria-hidden />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" aria-hidden />
      )}
    </button>
  );
}
