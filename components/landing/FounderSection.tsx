"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Linkedin,
  Quote,
  Code2,
  Sparkles,
  Globe2,
  Layers,
} from "lucide-react";
import { MotionSection } from "./MotionSection";
import { getLandingDict, type LandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";

const LINKEDIN = "https://www.linkedin.com/in/meryem-boulbassir-1806891a9/";

interface Skill {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: keyof LandingDict;
  gradient: string;
}

const SKILLS: Skill[] = [
  { icon: Code2, labelKey: "founderSkill1", gradient: "from-cyan-400 to-blue-600" },
  { icon: Sparkles, labelKey: "founderSkill2", gradient: "from-emerald-400 to-teal-500" },
  { icon: Layers, labelKey: "founderSkill3", gradient: "from-violet-500 to-fuchsia-500" },
  { icon: Globe2, labelKey: "founderSkill4", gradient: "from-sky-400 to-indigo-600" },
];

export function FounderSection() {
  const [imgOk, setImgOk] = useState(true);
  const { language } = useTranslation();
  const dict = getLandingDict(language);
  const isArabic = language === "ar";

  return (
    <MotionSection className="relative overflow-hidden py-16 sm:py-20" id="founder">
      {/* Atmospheric backgrounds */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-[460px] w-[460px] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[420px] w-[420px] rounded-full bg-cyan-500/12 blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            {dict.founderBadge}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {dict.founderTitle}{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {dict.founderTitleAccent}
            </span>
          </h2>
        </div>

        {/* Split layout */}
        <div className="mt-12 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* IMAGE column */}
          <motion.div
            initial={{ opacity: 0, x: isArabic ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[280px] lg:col-span-4"
          >
            {/* Outer gradient ring */}
            <div
              aria-hidden
              className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 opacity-50 blur-2xl"
            />

            {/* Decorative floating tags */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute z-20 hidden sm:block ${
                isArabic ? "-right-6 top-10" : "-left-6 top-10"
              }`}
            >
              <div className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-900/90 px-3 py-1.5 text-xs text-white shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600">
                  <Code2 className="h-3 w-3 text-white" />
                </span>
                <span className="font-semibold">Full Stack AI</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className={`absolute z-20 hidden sm:block ${
                isArabic ? "-left-6 bottom-16" : "-right-6 bottom-16"
              }`}
            >
              <div className="flex items-center gap-2 rounded-full border border-violet-400/30 bg-slate-900/90 px-3 py-1.5 text-xs text-white shadow-2xl shadow-violet-500/20 backdrop-blur-xl">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
                  <Sparkles className="h-3 w-3 text-white" />
                </span>
                <span className="font-semibold">Arabic NLP</span>
              </div>
            </motion.div>

            {/* Image frame */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900/40 p-2 backdrop-blur-xl">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-slate-950">
                {imgOk ? (
                  <img
                    src="/founder.jpg"
                    alt="Meryem Boulbassir"
                    className="h-full w-full object-cover"
                    onError={() => setImgOk(false)}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <span className="bg-gradient-to-br from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-7xl font-extrabold tracking-tighter text-transparent">
                      MB
                    </span>
                  </div>
                )}

                {/* Subtle gradient overlay at the bottom */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"
                />

                {/* Verified badge floating on the image */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/20">
                  <BadgeCheck className="h-4 w-4 text-cyan-300" />
                  <span className="text-xs font-semibold text-white">Verified Founder</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CONTENT column */}
          <motion.div
            initial={{ opacity: 0, x: isArabic ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className={`lg:col-span-8 ${isArabic ? "lg:text-right" : "lg:text-left"} text-center`}
          >
            {/* Name + verified */}
            <div className={`flex flex-wrap items-center justify-center gap-2 ${
              isArabic ? "lg:justify-end" : "lg:justify-start"
            }`}>
              <h3 className="font-founder-name text-2xl text-white sm:text-3xl lg:text-[2.25rem]">
                MERYEM{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  BOULBASSIR
                </span>
              </h3>
              <BadgeCheck className="h-6 w-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            </div>

            <p className="mt-2 text-sm font-medium text-cyan-300 sm:text-base">
              {dict.founderRole}
            </p>

            {/* Quote */}
            <div className="relative mt-5">
              <Quote
                className={`absolute -top-1 h-8 w-8 text-violet-400/40 ${
                  isArabic ? "right-0" : "left-0"
                }`}
                aria-hidden
              />
              <p
                className={`text-base italic leading-relaxed text-slate-200 sm:text-lg ${
                  isArabic ? "pr-10" : "pl-10"
                }`}
              >
                {dict.founderQuote}
              </p>
            </div>

            {/* Bio */}
            <p className="mt-5 text-sm leading-relaxed text-slate-400">{dict.founderBio}</p>

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat
                value={dict.founderStat1Value}
                label={dict.founderStat1Label}
                gradient="from-cyan-400 to-blue-600"
              />
              <Stat
                value={dict.founderStat2Value}
                label={dict.founderStat2Label}
                gradient="from-violet-500 to-fuchsia-500"
              />
              <Stat
                value={dict.founderStat3Value}
                label={dict.founderStat3Label}
                gradient="from-emerald-400 to-teal-500"
              />
            </div>

            {/* Skills chips */}
            <div className={`mt-6 flex flex-wrap items-center justify-center gap-2 ${
              isArabic ? "lg:justify-end" : "lg:justify-start"
            }`}>
              {SKILLS.map((skill) => {
                const Icon = skill.icon;
                return (
                  <span
                    key={skill.labelKey}
                    className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
                  >
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br ${skill.gradient}`}
                    >
                      <Icon className="h-3 w-3 text-white" />
                    </span>
                    {dict[skill.labelKey]}
                  </span>
                );
              })}
            </div>

            {/* CTA */}
            <div className={`mt-6 flex flex-col items-center gap-3 sm:flex-row ${
              isArabic ? "lg:justify-end" : "lg:justify-start"
            }`}>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20 transition-all hover:scale-[1.03] hover:shadow-violet-500/40"
              >
                <Linkedin className="h-4 w-4" />
                {dict.founderCta}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </MotionSection>
  );
}

function Stat({
  value,
  label,
  gradient,
}: {
  value: string;
  label: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]">
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30`}
      />
      <p
        className={`bg-gradient-to-br ${gradient} bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl`}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-white/60">{label}</p>
    </div>
  );
}
