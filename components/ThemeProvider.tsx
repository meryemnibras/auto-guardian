"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "aidrivex-theme";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Applies the `dark` class to <html> so Tailwind's `dark:` variants switch.
 * Default is dark (the brand look). The no-flash inline script in the root
 * layout sets the initial class before paint; this provider keeps it in sync
 * and persists the user's choice.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Read the resolved theme the inline script already applied to <html>.
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(isDark ? "dark" : "light");
  }, []);

  const apply = useCallback((t: Theme) => {
    const html = document.documentElement;
    if (t === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* storage may be unavailable (private mode) — ignore */
    }
  }, []);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      apply(t);
    },
    [apply]
  );

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      apply(next);
      return next;
    });
  }, [apply]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggle, setTheme }),
    [theme, toggle, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
