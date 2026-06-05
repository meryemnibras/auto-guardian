"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { MotionSection } from "./MotionSection";
import { getLandingDict, type LandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { PRO_PRICE, formatPrice } from "@/lib/currency";

interface Tier {
  nameKey: keyof LandingDict;
  amountKey: keyof LandingDict;
  periodKey?: keyof LandingDict;
  descKey: keyof LandingDict;
  ctaKey: keyof LandingDict;
  featureKeys: (keyof LandingDict)[];
  highlighted: boolean;
  badgeKey?: keyof LandingDict;
}

const TIERS: Tier[] = [
  {
    nameKey: "priceBasicName",
    amountKey: "priceBasicAmount",
    descKey: "priceBasicDesc",
    ctaKey: "priceBasicCta",
    featureKeys: ["priceBasicF1", "priceBasicF2", "priceBasicF3", "priceBasicF4"],
    highlighted: false,
  },
  {
    nameKey: "priceProName",
    amountKey: "priceProAmount",
    periodKey: "priceProPeriod",
    descKey: "priceProDesc",
    ctaKey: "priceProCta",
    featureKeys: [
      "priceProF1",
      "priceProF2",
      "priceProF3",
      "priceProF4",
      "priceProF5",
      "priceProF6",
    ],
    highlighted: true,
    badgeKey: "priceProBadge",
  },
];

export function PricingSection() {
  const { language } = useTranslation();
  const { currency } = useCurrency();
  const dict = getLandingDict(language);
  const proPriceFormatted = formatPrice(PRO_PRICE[currency], currency, language);
  const isArabic = language === "ar";

  return (
    <MotionSection className="relative py-14 sm:py-20 lg:py-28" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
            {dict.priceBadge}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {dict.priceTitle}{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {dict.priceTitleAccent}
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">{dict.priceSubtitle}</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.nameKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 ${
                tier.highlighted
                  ? "bg-slate-900/70 shadow-2xl shadow-blue-500/20"
                  : "border border-white/10 bg-slate-900/40 backdrop-blur"
              }`}
            >
              {tier.highlighted && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 p-[1.5px]"
                >
                  <span className="block h-full w-full rounded-[calc(1.5rem-1.5px)] bg-slate-950/80" />
                </span>
              )}

              <div className="relative">
                {tier.badgeKey && (
                  <span
                    className={`absolute -top-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg shadow-blue-500/30 ${
                      isArabic ? "-left-2" : "-right-2"
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    {dict[tier.badgeKey]}
                  </span>
                )}

                <h3 className="text-2xl font-bold text-white">{dict[tier.nameKey]}</h3>
                <p className="mt-2 text-sm text-slate-300">{dict[tier.descKey]}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span
                    className={`text-5xl font-extrabold ${
                      tier.highlighted
                        ? "bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent"
                        : "text-white"
                    }`}
                  >
                    {tier.highlighted ? proPriceFormatted : dict[tier.amountKey]}
                  </span>
                  {tier.periodKey && (
                    <span className="text-sm text-slate-400">{dict[tier.periodKey]}</span>
                  )}
                </div>

                <ul className="mt-6 space-y-3">
                  {tier.featureKeys.map((fk) => (
                    <li key={fk} className="flex items-start gap-3 text-sm text-slate-200">
                      <span
                        className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full ${
                          tier.highlighted
                            ? "bg-gradient-to-br from-cyan-400 to-violet-500"
                            : "bg-white/10"
                        }`}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </span>
                      <span>{dict[fk]}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.highlighted ? "/checkout" : "#download"}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/30 hover:scale-[1.02] hover:shadow-violet-500/40"
                      : "border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  {dict[tier.ctaKey]}
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">{dict.priceFootnote}</p>
      </div>
    </MotionSection>
  );
}
