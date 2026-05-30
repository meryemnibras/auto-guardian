"use client";

import { motion } from "framer-motion";
import { MotionSection } from "./MotionSection";
import { FEATURE_ITEMS } from "@/lib/landingData";
import { getLandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";

export function FeaturesSection() {
  const { language } = useTranslation();
  const dict = getLandingDict(language);

  return (
    <MotionSection className="relative py-20 sm:py-28" id="features">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
            {dict.featBadge}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {dict.featTitle}{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {dict.featTitleAccent}
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">{dict.featSubtitle}</p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURE_ITEMS.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.titleKey}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div
                  className={`pointer-events-none absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`}
                />

                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg shadow-blue-500/20`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </span>

                <h3 className="mt-5 text-lg font-bold text-white sm:text-xl">
                  {dict[feature.titleKey]}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {dict[feature.descKey]}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </MotionSection>
  );
}
