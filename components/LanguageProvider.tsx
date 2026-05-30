"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import translations from "@/lib/translations.json";
import type {
  Direction,
  SupportedLanguage,
  TranslationKey,
  TranslationsBundle,
} from "@/types/i18n";

const BUNDLE = translations as TranslationsBundle;
const DEFAULT_LANGUAGE: SupportedLanguage = "en";

interface LanguageContextValue {
  language: SupportedLanguage;
  direction: Direction;
  t: (key: TranslationKey) => string;
  setLanguage: (lang: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;
  const tag = (navigator.language || DEFAULT_LANGUAGE).toLowerCase();
  if (tag.startsWith("ar")) return "ar";
  if (tag.startsWith("fr")) return "fr";
  return "en";
}

function directionFor(lang: SupportedLanguage): Direction {
  return lang === "ar" ? "rtl" : "ltr";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start with the same value the server rendered to avoid hydration mismatch;
  // the real language is applied after mount via the effect below.
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    setLanguage(detectBrowserLanguage());
  }, []);

  useEffect(() => {
    const dir = directionFor(language);
    const html = document.documentElement;
    html.lang = language;
    html.dir = dir;
    if (language === "ar") {
      html.classList.add("arabic-font");
    } else {
      html.classList.remove("arabic-font");
    }
  }, [language]);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = BUNDLE[language] ?? BUNDLE[DEFAULT_LANGUAGE];
      return dict[key] ?? key;
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, direction: directionFor(language), t, setLanguage }),
    [language, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used inside <LanguageProvider />");
  }
  return ctx;
}
