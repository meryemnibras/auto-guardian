"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, ChevronDown } from "lucide-react";
import { NAV_LINKS } from "@/lib/landingData";
import { getLandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { CURRENCIES, CURRENCY_ORDER } from "@/lib/currency";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [logoOk, setLogoOk] = useState(true);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const dict = getLandingDict(language);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close currency dropdown on outside click
  useEffect(() => {
    if (!currencyOpen) return;
    function onClick(e: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [currencyOpen]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* True frosted-glass panel */}
      <div
        className={`relative transition-all duration-500 ${
          scrolled
            ? "bg-white/[0.06] backdrop-blur-2xl backdrop-saturate-150"
            : "bg-white/[0.03] backdrop-blur-xl backdrop-saturate-150"
        }`}
        style={{
          WebkitBackdropFilter: scrolled
            ? "blur(28px) saturate(150%)"
            : "blur(20px) saturate(150%)",
        }}
      >
        {/* Top highlight — subtle inner glow at the very top edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
        {/* Bottom hairline */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-60"
          } bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent`}
        />
        {/* Soft outer drop-shadow */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 -bottom-6 h-6 transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          } bg-gradient-to-b from-black/40 to-transparent blur-md`}
        />

        <nav className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="#top" className="group relative flex items-center gap-3">
            {/* Soft cyan halo behind the logo so dark navy parts pop on glass */}
            <span
              aria-hidden
              className="pointer-events-none absolute -left-2 -top-2 -z-10 h-28 w-28 rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-violet-500/15 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            />
            {logoOk ? (
              <img
                src="/logo.png"
                alt="AI DriveX"
                className="h-20 w-20 object-contain drop-shadow-[0_2px_18px_rgba(34,211,238,0.55)] sm:h-24 sm:w-24"
                onError={() => setLogoOk(false)}
              />
            ) : (
              <span className="text-2xl font-extrabold tracking-tighter text-cyan-300 drop-shadow-[0_0_16px_rgba(34,211,238,0.7)]">
                AX
              </span>
            )}
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-2xl">
              AI{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                DriveX
              </span>
            </span>
          </a>

          {/* Links */}
          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] transition-colors hover:text-white"
                >
                  {dict[link.labelKey]}
                </a>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency switcher */}
            <div ref={currencyRef} className="relative">
              <button
                type="button"
                onClick={() => setCurrencyOpen((o) => !o)}
                aria-label="Select currency"
                aria-expanded={currencyOpen}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white backdrop-blur-md transition-all hover:border-white/35 hover:bg-white/20"
              >
                <span aria-hidden className="text-sm leading-none">
                  {CURRENCIES[currency].flag}
                </span>
                <span>{currency}</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${currencyOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {currencyOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/95 p-1 shadow-2xl shadow-blue-500/20 backdrop-blur-xl"
                  >
                    {CURRENCY_ORDER.map((c) => {
                      const cfg = CURRENCIES[c];
                      const active = c === currency;
                      return (
                        <li key={c}>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrency(c);
                              setCurrencyOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                              active
                                ? "bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-violet-500/15 text-white"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span aria-hidden className="text-base leading-none">
                              {cfg.flag}
                            </span>
                            <span className="flex-1">
                              <span className="block text-xs font-semibold">{c}</span>
                              <span className="block text-[10px] text-white/55">
                                {cfg.name[language === "ar" ? "ar" : "en"]}
                              </span>
                            </span>
                            {active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              aria-label="Toggle language"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white backdrop-blur-md transition-all hover:border-white/35 hover:bg-white/20"
            >
              <Languages className="h-3.5 w-3.5" />
              <span>{dict.langToggle}</span>
            </button>

            <a
              href="/checkout"
              className="hidden rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/40 ring-1 ring-white/20 transition-all hover:scale-[1.03] hover:shadow-violet-500/50 sm:inline-flex sm:px-5 sm:py-2.5 sm:text-sm"
            >
              {dict.navCta}
            </a>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
