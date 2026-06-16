"use client";

import Link from "next/link";
import {
  MessageCircle,
  Activity,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  Settings as SettingsIcon,
  Sparkles,
  WifiOff,
  ArrowLeft,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/components/auth/AuthProvider";
import type { TranslationKey } from "@/types/i18n";

interface FeatureCard {
  href: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  icon: LucideIcon;
  /** Gradient + icon tint applied to the card's icon badge. */
  accent: string;
}

const FEATURES: FeatureCard[] = [
  {
    href: "/diagnostics",
    titleKey: "diagnostics",
    descKey: "homeDiagnosticsDesc",
    icon: Activity,
    accent: "from-sky-500/25 to-blue-600/10 text-sky-500 dark:text-sky-300",
  },
  {
    href: "/wallet",
    titleKey: "wallet",
    descKey: "homeWalletDesc",
    icon: Wallet,
    accent:
      "from-emerald-500/25 to-green-600/10 text-emerald-600 dark:text-emerald-300",
  },
  {
    href: "/emergency",
    titleKey: "emergency",
    descKey: "homeEmergencyDesc",
    icon: ShieldAlert,
    accent: "from-rose-500/25 to-red-600/10 text-rose-500 dark:text-rose-300",
  },
  {
    href: "/settings",
    titleKey: "settingsLabel",
    descKey: "homeSettingsDesc",
    icon: SettingsIcon,
    accent:
      "from-violet-500/25 to-purple-600/10 text-violet-500 dark:text-violet-300",
  },
];

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const initial = user?.email?.[0]?.toUpperCase() ?? null;

  return (
    <section className="flex flex-1 flex-col gap-6">
      {/* ---- Top bar: brand · theme toggle · login ---- */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="AI DriveX"
            className="h-9 w-9 rounded-xl object-contain"
          />
          <span className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            AI DriveX
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Link
            href="/settings"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            {initial ? (
              <>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white">
                  {initial}
                </span>
                <span className="hidden sm:inline">{t("homeAccount")}</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" aria-hidden />
                {t("homeLogin")}
              </>
            )}
          </Link>
        </div>
      </div>

      {/* ---- Lively hero ---- */}
      <header className="relative overflow-hidden rounded-[28px] border border-white/10 p-6 shadow-[0_30px_70px_-30px_rgba(59,130,246,0.85)]">
        {/* base gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950"
          aria-hidden
        />
        {/* dotted texture */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.22) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />
        {/* faint white-logo watermark */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/white.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-12 w-48 rotate-12 opacity-[0.07] rtl:left-auto rtl:-right-12 rtl:-rotate-12"
        />
        {/* drifting glow blobs */}
        <div
          className="animate-drift pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-sky-500/30 blur-3xl"
          aria-hidden
        />
        <div
          className="animate-drift pointer-events-none absolute -bottom-16 right-8 h-40 w-40 rounded-full bg-violet-500/25 blur-3xl [animation-delay:1.6s]"
          aria-hidden
        />
        {/* top sheen line */}
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
          aria-hidden
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {t("offlineReady")}
              </span>
              <h1 className="mt-3 bg-gradient-to-br from-white via-sky-100 to-sky-300 bg-clip-text text-[26px] font-extrabold leading-[1.15] tracking-tight text-transparent">
                {t("homeHeroTitle")}
              </h1>
              <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-blue-100/75">
                {t("homeHeroSubtitle")}
              </p>
            </div>

            {/* animated illustration: AI listening to the car */}
            <HeroIllustration />
          </div>

          {/* capability chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            <HeroChip icon={Activity} label={t("heroChipScan")} />
            <HeroChip icon={MessageCircle} label={t("heroChipAssistant")} />
            <HeroChip icon={ShieldCheck} label={t("heroChipPrivacy")} />
          </div>
        </div>
      </header>

      {/* ---- Primary CTA: Smart Chat ---- */}
      <Link
        href="/chat"
        className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-600 to-violet-600 p-5 shadow-[0_20px_50px_-20px_rgba(99,102,241,0.7)] transition-transform active:scale-[0.98]"
      >
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur"
          aria-hidden
        >
          <MessageCircle className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-base font-bold text-white">
            {t("homeChatTitle")}
            <Sparkles className="h-4 w-4 text-amber-200" aria-hidden />
          </p>
          <p className="mt-0.5 truncate text-xs text-blue-100">
            {t("homeChatDesc")}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
            {t("homeStartChat")}
            <ArrowLeft
              className="h-3.5 w-3.5 transition-transform group-active:-translate-x-0.5 rtl:rotate-180"
              aria-hidden
            />
          </span>
        </div>
      </Link>

      {/* ---- Feature grid ---- */}
      <div className="space-y-3">
        <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("homeExplore")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ href, titleKey, descKey, icon: Icon, accent }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97] dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none dark:hover:border-white/20 dark:hover:bg-slate-900/90"
            >
              <span
                className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${accent} transition-transform group-hover:scale-110`}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t(titleKey)}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {t(descKey)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Small frosted pill highlighting a core capability of the app. */
function HeroChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-medium text-blue-50 backdrop-blur">
      <Icon className="h-3.5 w-3.5 text-sky-300" aria-hidden />
      {label}
    </span>
  );
}

/**
 * Compact, lively SVG: a car with pulsing "AI sound" bars + sparkle,
 * gently floating. Pure CSS animation (respects prefers-reduced-motion).
 */
function HeroIllustration() {
  const bars = [0, 1, 2, 3, 4];
  return (
    <div className="animate-float-soft relative shrink-0">
      {/* "listening" pulse ring */}
      <span
        className="pointer-events-none absolute inset-0 m-auto h-16 w-16 animate-ping rounded-full border border-sky-400/30"
        aria-hidden
      />
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden
        className="drop-shadow-[0_8px_20px_rgba(59,130,246,0.45)]"
      >
        <defs>
          <linearGradient id="carBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#60a5fa" />
            <stop offset="1" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        {/* halo */}
        <circle cx="48" cy="50" r="34" fill="#3b82f6" opacity="0.12" />
        {/* car body */}
        <path
          d="M22 58c0-3 2-5 5-5l5-9c1-2 3-3 5-3h18c2 0 4 1 5 3l5 9c3 0 5 2 5 5v6a3 3 0 0 1-3 3h-3a6 6 0 0 1-12 0H40a6 6 0 0 1-12 0h-3a3 3 0 0 1-3-3z"
          fill="url(#carBody)"
        />
        {/* windows */}
        <path
          d="M35 44c.6-1.2 1.6-2 3-2h20c1.4 0 2.4.8 3 2l3 8H32z"
          fill="#0b1020"
          opacity="0.55"
        />
        {/* wheels */}
        <circle cx="34" cy="67" r="5" fill="#0b1020" />
        <circle cx="62" cy="67" r="5" fill="#0b1020" />
        <circle cx="34" cy="67" r="2" fill="#94a3b8" />
        <circle cx="62" cy="67" r="2" fill="#94a3b8" />
        {/* AI sound bars above the car */}
        <g>
          {bars.map((i) => (
            <rect
              key={i}
              className="hero-bar"
              x={36 + i * 6}
              y={20}
              width="3.5"
              height="14"
              rx="1.75"
              fill={i % 2 === 0 ? "#38bdf8" : "#a78bfa"}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </g>
      </svg>
      {/* sparkle */}
      <Sparkles
        className="absolute -right-1 -top-1 h-5 w-5 text-amber-300"
        aria-hidden
      />
    </div>
  );
}
