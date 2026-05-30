"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, type LucideIcon } from "lucide-react";
import { MotionSection } from "./MotionSection";
import { PAIN_ITEMS } from "@/lib/landingData";
import { getLandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";

/**
 * Per-card palette restricted to the logo's family:
 * light blue (sky/cyan) → blue → navy → violet → green (emerald/teal).
 * Eight unique combos, but visually one family.
 */
interface CardStyle {
  ring: string;
  iconBg: string;
  glow: string;
  numberBg: string;
}

const CARD_STYLES: CardStyle[] = [
  {
    ring: "from-cyan-400/70 to-blue-600/70",
    iconBg: "from-cyan-400 to-blue-600",
    glow: "from-cyan-400/30 to-blue-600/30",
    numberBg: "from-cyan-400/15 to-blue-600/15",
  },
  {
    ring: "from-blue-400/70 to-violet-600/70",
    iconBg: "from-blue-500 to-violet-600",
    glow: "from-blue-500/30 to-violet-600/30",
    numberBg: "from-blue-500/15 to-violet-600/15",
  },
  {
    ring: "from-emerald-400/70 to-cyan-500/70",
    iconBg: "from-emerald-400 to-teal-500",
    glow: "from-emerald-400/30 to-cyan-500/30",
    numberBg: "from-emerald-400/15 to-cyan-500/15",
  },
  {
    ring: "from-violet-400/70 to-blue-500/70",
    iconBg: "from-violet-500 to-blue-500",
    glow: "from-violet-500/30 to-cyan-500/30",
    numberBg: "from-violet-500/15 to-blue-500/15",
  },
  {
    ring: "from-sky-300/70 to-emerald-500/70",
    iconBg: "from-sky-400 to-emerald-500",
    glow: "from-sky-400/30 to-emerald-400/30",
    numberBg: "from-sky-400/15 to-emerald-500/15",
  },
  {
    ring: "from-cyan-300/70 to-indigo-600/70",
    iconBg: "from-cyan-300 to-indigo-600",
    glow: "from-cyan-400/30 to-indigo-600/30",
    numberBg: "from-cyan-300/15 to-indigo-600/15",
  },
  {
    ring: "from-teal-400/70 to-blue-600/70",
    iconBg: "from-teal-400 to-blue-600",
    glow: "from-teal-400/30 to-blue-500/30",
    numberBg: "from-teal-400/15 to-blue-600/15",
  },
  {
    ring: "from-violet-500/70 to-emerald-500/70",
    iconBg: "from-violet-500 to-emerald-500",
    glow: "from-violet-500/30 to-emerald-400/30",
    numberBg: "from-violet-500/15 to-emerald-500/15",
  },
];

interface CardProps {
  index: number;
  Icon: LucideIcon;
  problem: string;
  solution: string;
  problemLabel: string;
  solutionLabel: string;
}

function PainCard({
  index,
  Icon,
  problem,
  solution,
  problemLabel,
  solutionLabel,
}: CardProps) {
  const style = CARD_STYLES[index % CARD_STYLES.length];
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative h-full"
    >
      {/* Outer gradient ring */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -inset-[1px] rounded-3xl bg-gradient-to-br ${style.ring} opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Outer glow on hover */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -inset-3 -z-10 rounded-[28px] bg-gradient-to-br ${style.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
      />

      <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-950 backdrop-blur-xl">
        {/* Top half — Problem */}
        <div className="relative p-6 pb-5">
          {/* Faint orb */}
          <div
            aria-hidden
            className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${style.iconBg} opacity-[0.12] blur-2xl transition-opacity duration-500 group-hover:opacity-25`}
          />

          {/* Number badge — opposite the icon */}
          <span
            className={`absolute top-5 left-5 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${style.numberBg} text-[11px] font-extrabold tracking-tighter text-white/60 ring-1 ring-white/10`}
          >
            {number}
          </span>

          {/* Icon */}
          <span
            className={`relative inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${style.iconBg} shadow-lg shadow-black/40 ring-1 ring-white/20`}
          >
            <Icon className="h-7 w-7 text-white" />
          </span>

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-300/80">
            {problemLabel}
          </p>
          <h3 className="mt-1.5 text-lg font-bold leading-snug text-white">{problem}</h3>
        </div>

        {/* Divider with arrow */}
        <div className="relative px-6">
          <div className="flex items-center gap-3">
            <span className={`h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent`} />
            <span
              className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${style.iconBg} text-white shadow-md shadow-black/40 ring-2 ring-slate-950`}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>

        {/* Bottom half — Solution (highlighted) */}
        <div
          className={`relative mt-2 flex-1 bg-gradient-to-br ${style.numberBg} p-6 pt-5`}
        >
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/90">
            <Check className="h-3 w-3" />
            {solutionLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-100/95">{solution}</p>
        </div>
      </div>
    </motion.article>
  );
}

export function PainPointsSection() {
  const { language } = useTranslation();
  const dict = getLandingDict(language);
  const Arrow = language === "ar" ? ArrowUp : ArrowDown; // unused placeholder; keeps tree-shake happy
  void Arrow;

  return (
    <MotionSection className="relative py-20 sm:py-28" id="pain">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-10 h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute right-1/4 bottom-10 h-[380px] w-[380px] rounded-full bg-violet-600/12 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-200 backdrop-blur">
            {dict.painBadge}
          </span>
          <h2 className="relative mt-6 text-3xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(139,92,246,0.3)] sm:text-4xl md:text-5xl lg:text-[3.5rem]">
            {/* Faint outline halo behind the heading for extra punch */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 select-none bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-violet-400/10 bg-clip-text text-transparent blur-2xl"
            >
              {dict.painTitle} {dict.painTitleAccent}
            </span>
            {dict.painTitle}{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {dict.painTitleAccent}
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
            {dict.painSubtitle}
          </p>

          {/* Tiny legend */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-300 backdrop-blur">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              {dict.painProblemLabel}
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {dict.painSolutionLabel}
            </span>
          </div>
        </div>

        {/* Cards grid — uniform 4 columns × 2 rows on desktop, 2 on tablet, 1 on mobile */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PAIN_ITEMS.map((item, i) => (
            <PainCard
              key={item.problemKey}
              index={i}
              Icon={item.icon}
              problem={dict[item.problemKey] as string}
              solution={dict[item.solutionKey] as string}
              problemLabel={dict.painProblemLabel}
              solutionLabel={dict.painSolutionLabel}
            />
          ))}
        </motion.div>
      </div>
    </MotionSection>
  );
}
