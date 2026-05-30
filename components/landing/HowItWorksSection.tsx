"use client";

import { motion } from "framer-motion";
import { MotionSection } from "./MotionSection";
import { STEP_ITEMS } from "@/lib/landingData";
import { getLandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";

export function HowItWorksSection() {
  const { language } = useTranslation();
  const dict = getLandingDict(language);
  const isArabic = language === "ar";

  return (
    <MotionSection className="relative py-20 sm:py-28" id="how">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
            {dict.howBadge}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {dict.howTitle}{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {dict.howTitleAccent}
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">{dict.howSubtitle}</p>
        </div>

        <div className="relative mt-16">
          <div
            aria-hidden
            className="absolute right-[10%] left-[10%] top-10 hidden h-px bg-gradient-to-r from-violet-500/0 via-blue-500/60 to-cyan-400/0 md:block"
          />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {STEP_ITEMS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`relative text-center ${isArabic ? "md:text-right" : "md:text-left"}`}
              >
                <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center md:mx-0">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 opacity-20 blur-xl" />
                  <span className="relative grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-slate-900/80 backdrop-blur-xl">
                    <span className="bg-gradient-to-br from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-2xl font-extrabold text-transparent">
                      {step.number}
                    </span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  {dict[step.titleKey]}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                  {dict[step.descKey]}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
