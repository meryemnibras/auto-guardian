"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type Currency, CURRENCIES } from "@/lib/currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "ai-drivex-currency";
const DEFAULT_CURRENCY: Currency = "SAR";

function detectInitialCurrency(): Currency {
  if (typeof navigator === "undefined") return DEFAULT_CURRENCY;
  const lang = navigator.language?.toLowerCase() ?? "";
  // Heuristic: route Eurozone / European locales to EUR, US/UK to USD,
  // and Arabic to SAR (already the default).
  if (/^(de|fr|es|it|nl|pt|pl|el|fi|sv|da|no|cs|hu|ro|sk|sl|hr)/.test(lang))
    return "EUR";
  if (/^en(-us|-ca|-au|-nz)?$/.test(lang) || /^en$/.test(lang)) return "USD";
  return DEFAULT_CURRENCY;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe: start with default, then sync from storage / locale post-mount.
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in CURRENCIES) {
        setCurrencyState(saved as Currency);
        return;
      }
    } catch {
      /* ignore — private mode etc. */
    }
    setCurrencyState(detectInitialCurrency());
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency }),
    [currency, setCurrency]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used inside <CurrencyProvider />");
  }
  return ctx;
}
