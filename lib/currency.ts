export type Currency = "SAR" | "USD" | "EUR";

export interface CurrencyConfig {
  code: Currency;
  /** Symbol used in LTR contexts */
  symbol: string;
  /** Short label shown in Arabic — placed AFTER the number */
  symbolAr: string;
  /** ISO locale used for formatting */
  locale: string;
  /** UI labels per language */
  name: { ar: string; en: string };
  /** Flag emoji for the picker */
  flag: string;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  SAR: {
    code: "SAR",
    symbol: "SAR",
    symbolAr: "ر.س",
    locale: "ar-SA",
    name: { ar: "ريال سعودي", en: "Saudi Riyal" },
    flag: "🇸🇦",
  },
  USD: {
    code: "USD",
    symbol: "$",
    symbolAr: "$",
    locale: "en-US",
    name: { ar: "دولار أمريكي", en: "US Dollar" },
    flag: "🇺🇸",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    symbolAr: "€",
    locale: "en-IE",
    name: { ar: "يورو", en: "Euro" },
    flag: "🇪🇺",
  },
};

/**
 * Plan price per currency. We don't compute from a single base because we
 * want rounded "marketable" prices in each market — not raw FX conversions.
 *
 *   SAR 300  ≈  USD 80  ≈  EUR 75
 */
export const PRO_PRICE: Record<Currency, number> = {
  SAR: 300,
  USD: 80,
  EUR: 75,
};

/** Local tax applied at checkout. Only SAR market applies VAT here. */
export const VAT_RATE: Record<Currency, number> = {
  SAR: 0.15,
  USD: 0,
  EUR: 0,
};

/**
 * Format an amount in the given currency.
 *  - Arabic: number first, then the localized symbol (ر.س / $ / €)
 *  - English: standard symbol + amount
 */
export function formatPrice(
  amount: number,
  currency: Currency,
  language: string
): string {
  const cfg = CURRENCIES[currency];
  const isArabic = language === "ar";
  // Use plain number, no native locale grouping so RTL layout stays predictable
  const num = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return isArabic
    ? `${num} ${cfg.symbolAr}`
    : currency === "SAR"
    ? `${num} ${cfg.symbol}`
    : `${cfg.symbol}${num}`;
}

/** Render only the symbol — useful for inline button copy. */
export function currencySymbol(currency: Currency, language: string): string {
  const cfg = CURRENCIES[currency];
  return language === "ar" ? cfg.symbolAr : cfg.symbol;
}

export const CURRENCY_ORDER: Currency[] = ["SAR", "USD", "EUR"];
