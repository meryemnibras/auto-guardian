"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Play,
  Download,
  Apple,
  Volume2,
  ShieldCheck,
  ChevronDown,
  Wifi,
  Signal,
  BatteryFull,
  Bell,
  Camera,
  ParkingCircle,
  Siren,
  Home as HomeIcon,
  Activity,
  Wallet,
  User,
  Mic,
} from "lucide-react";
import { ORBIT_BADGES } from "@/lib/landingData";
import { getLandingDict, type LandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";

export function HeroSection() {
  const { language } = useTranslation();
  const dict = getLandingDict(language);
  const isArabic = language === "ar";

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32"
    >
      {/* Layered background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-1/4 h-[480px] w-[480px] rounded-full bg-blue-600/30 blur-[120px]" />
        <div className="absolute top-20 left-1/4 h-[420px] w-[420px] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0)_0%,rgba(2,6,23,0.8)_60%,rgba(2,6,23,1)_100%)]" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Copy */}
        <div className={`text-center ${isArabic ? "lg:text-right" : "lg:text-left"}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-200 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {dict.heroBadge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:mt-6 sm:text-5xl lg:text-6xl"
          >
            {dict.heroTitleLine1}
            <br />
            {dict.heroTitleLine2}
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {dict.heroTitleAccent}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:mt-6 sm:text-lg lg:mx-0"
          >
            {dict.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3 lg:justify-start"
          >
            <a
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.03] hover:shadow-violet-500/40 sm:px-6 sm:py-3 sm:text-base"
            >
              {dict.heroCtaPrimary}
            </a>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10 sm:px-6 sm:py-3 sm:text-base"
            >
              <Play className="h-4 w-4" />
              {dict.heroCtaSecondary}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            <a
              href="#download"
              className={`inline-flex items-center gap-3 rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2.5 text-white backdrop-blur transition-all hover:border-white/30 ${
                isArabic ? "text-right" : "text-left"
              }`}
            >
              <Download className="h-5 w-5 text-cyan-300" />
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] text-slate-400">{dict.storeDownloadFrom}</span>
                <span className="text-sm font-semibold">{dict.storeGoogle}</span>
              </span>
            </a>
            <a
              href="#download"
              className={`inline-flex items-center gap-3 rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2.5 text-white backdrop-blur transition-all hover:border-white/30 ${
                isArabic ? "text-right" : "text-left"
              }`}
            >
              <Apple className="h-5 w-5 text-violet-300" />
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] text-slate-400">{dict.storeDownloadFrom}</span>
                <span className="text-sm font-semibold">{dict.storeApple}</span>
              </span>
            </a>
          </motion.div>
        </div>

        {/* Phone showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative mx-auto w-full max-w-xl"
        >
          {/* Big faded logo watermark — brand identity behind the phone */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 hidden place-items-center sm:grid"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-[360px] w-[360px] object-contain opacity-[0.08] blur-[1px] [mask-image:radial-gradient(circle,black_35%,transparent_75%)] sm:h-[480px] sm:w-[480px]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          <PhoneOrbit dict={dict} />
        </motion.div>
      </div>

      {/* Scroll hint */}
      <a
        href="#pain"
        aria-label="Scroll down"
        className="scroll-hint absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/60 transition-colors hover:text-white"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 backdrop-blur">
          <ChevronDown className="h-5 w-5" />
        </span>
      </a>
    </section>
  );
}

/**
 * Six floating badges placed in explicit slots OUTSIDE the phone screen so
 * nothing overlaps the device.
 *  Container is square (~600px), phone is 280px centered → safe horizontal
 *  zone for badges starts at ~26% from each edge.
 */
const BADGE_SLOTS: Array<{ side: "left" | "right"; top: string; offset: string }> = [
  { side: "left", top: "8%", offset: "-2%" },   // 0 — Voice Scan (top-left)
  { side: "right", top: "8%", offset: "-2%" },  // 1 — Key Guardian (top-right)
  { side: "right", top: "44%", offset: "-6%" }, // 2 — Instant SOS (mid-right)
  { side: "left", top: "44%", offset: "-6%" },  // 3 — Smart Wallet (mid-left)
  { side: "left", top: "80%", offset: "-2%" },  // 4 — Parking GPS (bottom-left)
  { side: "right", top: "80%", offset: "-2%" }, // 5 — Bump Memory (bottom-right)
];

function PhoneOrbit({ dict }: { dict: LandingDict }) {
  return (
    <div className="relative mx-auto flex w-full items-center justify-center sm:block sm:aspect-square sm:max-w-[620px]">
      {/* Orbit rings — only on sm+ where the orbital layout has room */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 hidden h-[94%] w-[94%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/10 sm:block"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 hidden h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/5 sm:block"
      />

      {/* Phone — naturally placed on mobile, absolute-centered on sm+ */}
      <div className="sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
        <PhoneMockup dict={dict} />
      </div>

      {/* Floating badges — explicit slots, fully outside the phone screen */}
      {ORBIT_BADGES.map((b, i) => {
        const slot = BADGE_SLOTS[i % BADGE_SLOTS.length];
        const Icon = b.icon;
        const style =
          slot.side === "left"
            ? { left: slot.offset, top: slot.top }
            : { right: slot.offset, top: slot.top };

        return (
          <motion.div
            key={b.labelKey}
            initial={{
              opacity: 0,
              x: slot.side === "left" ? -20 : 20,
            }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + i * 0.12 }}
            className="absolute z-20 hidden sm:block"
            style={style}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3.6 + (i % 3) * 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: b.delay,
              }}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-slate-900/85 px-3 py-1.5 text-xs text-white shadow-2xl shadow-blue-500/20 backdrop-blur-xl"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500">
                <Icon className="h-3 w-3 text-white" />
              </span>
              <span className="font-medium">{dict[b.labelKey]}</span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------- */
/* Realistic, branded phone screen showcasing the app from the inside */
/* ----------------------------------------------------------------- */
function PhoneMockup({ dict }: { dict: LandingDict }) {
  return (
    <div className="relative">
      {/* Soft glow under phone */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[3.5rem] bg-gradient-to-b from-cyan-500/20 via-blue-600/30 to-violet-600/30 blur-3xl"
      />

      {/* Phone frame */}
      <div className="relative aspect-[9/19] w-[220px] rounded-[3rem] border border-white/10 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-[3px] shadow-[0_40px_120px_-20px_rgba(59,130,246,0.55),0_0_0_1px_rgba(255,255,255,0.04)] sm:w-[260px] lg:w-[280px]">
        {/* Side buttons */}
        <span
          aria-hidden
          className="absolute -right-[2px] top-24 h-12 w-[3px] rounded-l-md bg-slate-700"
        />
        <span
          aria-hidden
          className="absolute -left-[2px] top-20 h-8 w-[3px] rounded-r-md bg-slate-700"
        />
        <span
          aria-hidden
          className="absolute -left-[2px] top-32 h-14 w-[3px] rounded-r-md bg-slate-700"
        />

        {/* Inner bezel */}
        <div className="relative h-full w-full overflow-hidden rounded-[2.7rem] bg-black p-[2px]">
          {/* Screen */}
          <div className="relative h-full w-full overflow-hidden rounded-[2.55rem] bg-gradient-to-br from-slate-950 via-blue-950/30 to-violet-950/30">
            {/* Dynamic island / notch */}
            <div className="absolute left-1/2 top-2 z-30 flex h-6 w-24 -translate-x-1/2 items-center justify-center rounded-full bg-black">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-slate-700" />
              <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>

            {/* Subtle ambient gradients inside the screen */}
            <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(circle_at_25%_15%,rgba(34,211,238,0.18),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(168,85,247,0.22),transparent_45%)]" />

            {/* Faint logo watermark on the screen background */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-[0.06]">
              <img
                src="/white.png"
                alt=""
                className="h-44 w-44 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            {/* Status bar */}
            <div className="relative flex items-center justify-between px-5 pt-3 text-[10px] font-medium text-white">
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <Signal className="h-3 w-3" />
                <Wifi className="h-3 w-3" />
                <BatteryFull className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Branded header */}
            <div className="relative mt-5 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <img
                  src="/white.png"
                  alt="AI DriveX"
                  className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = "none";
                  }}
                />
                <span className="text-[11px] font-bold tracking-tight text-white">
                  AI{" "}
                  <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
                    DriveX
                  </span>
                </span>
              </div>
              <span className="relative grid h-7 w-7 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
                <Bell className="h-3.5 w-3.5 text-white/80" />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]" />
              </span>
            </div>

            {/* Greeting */}
            <div className="relative mt-3 px-4">
              <p className="text-[9px] text-slate-400">{dict.phoneGreeting}</p>
              <p className="text-sm font-bold text-white">{dict.phoneStatus}</p>
            </div>

            {/* Health gauge */}
            <div className="relative mt-3 px-4">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 backdrop-blur">
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />
                <div className="flex items-center gap-3">
                  <HealthRing percent={92} />
                  <div className="flex-1">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400">
                      Health Score
                    </p>
                    <p className="mt-0.5 text-base font-extrabold text-white">
                      92<span className="text-xs text-slate-400">/100</span>
                    </p>
                    <p className="mt-1 text-[9px] leading-tight text-emerald-300">
                      {dict.phoneOkTitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions grid */}
            <div className="relative mt-3 px-4">
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Actions
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                <QuickAction icon={Mic} label="Scan" tint="from-cyan-400 to-blue-600" />
                <QuickAction
                  icon={Camera}
                  label="Engine"
                  tint="from-violet-400 to-blue-600"
                />
                <QuickAction
                  icon={ParkingCircle}
                  label="Park"
                  tint="from-emerald-400 to-teal-500"
                />
                <QuickAction
                  icon={Siren}
                  label="SOS"
                  tint="from-rose-400 to-violet-500"
                />
              </div>
            </div>

            {/* Live insight (Acoustic scan in progress) */}
            <div className="relative mt-3 px-4">
              <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-violet-600/10 p-3 backdrop-blur">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-violet-500" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md shadow-blue-500/40">
                      <Volume2 className="h-3.5 w-3.5 text-white" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[10px] font-bold text-white">
                        {dict.phoneScanTitle}
                      </p>
                      <p className="text-[8px] text-slate-300">{dict.phoneScanProgress}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-cyan-400/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-200">
                    87%
                  </span>
                </div>

                {/* Live waveform */}
                <div className="mt-2 flex items-end gap-[2px]">
                  {[
                    20, 38, 60, 30, 70, 90, 55, 75, 40, 65, 88, 50, 35, 60, 45, 80,
                    25, 70, 55, 35,
                  ].map((h, i) => (
                    <span
                      key={i}
                      className="block w-[3px] rounded-full bg-gradient-to-t from-cyan-400 via-blue-500 to-violet-500"
                      style={{ height: `${h}%`, opacity: 0.3 + (i % 5) * 0.16 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mini metrics row */}
            <div className="relative mt-3 grid grid-cols-2 gap-2 px-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur">
                <p className="text-[8px] uppercase tracking-wider text-slate-400">
                  {dict.phoneOilLabel}
                </p>
                <p className="mt-0.5 text-[11px] font-extrabold text-white">
                  {dict.phoneOilValue}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2.5">
                <p className="text-[8px] uppercase tracking-wider text-emerald-300/80">
                  {dict.phoneSpendLabel}
                </p>
                <p className="mt-0.5 text-[11px] font-extrabold text-white">
                  {dict.phoneSpendValue}
                </p>
              </div>
            </div>

            {/* Bottom tab bar */}
            <div className="absolute inset-x-3 bottom-3">
              <div className="flex items-center justify-around rounded-2xl border border-white/10 bg-slate-900/80 px-2 py-2 backdrop-blur-xl">
                <TabIcon icon={HomeIcon} active />
                <TabIcon icon={Activity} />
                <CenterAction />
                <TabIcon icon={Wallet} />
                <TabIcon icon={User} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reflection under phone */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -bottom-6 h-12 w-[160px] -translate-x-1/2 rounded-[100%] bg-blue-500/30 blur-2xl"
      />
    </div>
  );
}

/* ---------- Phone helpers ---------- */

function HealthRing({ percent }: { percent: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative grid h-12 w-12 place-items-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3.5"
          fill="none"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle
          cx="22"
          cy="22"
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
        />
      </svg>
      <ShieldCheck className="h-4 w-4 text-emerald-300" />
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tint: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-2 backdrop-blur">
      <span
        className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${tint} shadow-md shadow-black/40 ring-1 ring-white/15`}
      >
        <Icon className="h-3.5 w-3.5 text-white" />
      </span>
      <span className="text-[8px] font-semibold text-white/80">{label}</span>
    </div>
  );
}

function TabIcon({
  icon: Icon,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}) {
  return (
    <span
      className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
        active
          ? "bg-gradient-to-br from-cyan-400/30 to-violet-500/30 text-cyan-200"
          : "text-slate-500"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

function CenterAction() {
  return (
    <span className="-mt-5 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-lg shadow-blue-500/40 ring-2 ring-slate-900">
      <Mic className="h-4 w-4 text-white" />
    </span>
  );
}
