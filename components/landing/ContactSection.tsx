"use client";

import { motion } from "framer-motion";
import { Calendar, Check, MessageCircle, Clock, Globe2 } from "lucide-react";
import { MotionSection } from "./MotionSection";
import { getLandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";

// Replace these with the real numbers/links before going live
const WHATSAPP_NUMBER = "966500000000"; // E.164, no + and no spaces
const CALENDLY_URL = "https://calendly.com/ai-drivex/demo";

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M19.05 4.91A10 10 0 0 0 2.27 17.5L1 22.94l5.58-1.46a10 10 0 0 0 4.96 1.27h.01A10 10 0 0 0 19.05 4.91zm-7.5 15.4h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.31.87.88-3.23-.2-.33A8.31 8.31 0 1 1 11.55 20.3zm4.55-6.2c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.57.13-.17.25-.65.81-.8.97-.15.17-.3.19-.55.06-.25-.13-1.05-.39-2-1.24a7.45 7.45 0 0 1-1.38-1.71c-.14-.25-.02-.39.11-.51.11-.11.25-.3.38-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.57-1.36-.78-1.86-.2-.49-.41-.42-.57-.43h-.49c-.17 0-.45.06-.69.32-.23.25-.91.89-.91 2.18 0 1.29.93 2.53 1.06 2.7.13.17 1.84 2.8 4.47 3.93.62.27 1.11.43 1.49.55.62.2 1.19.17 1.64.1.5-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.49-.29z" />
    </svg>
  );
}

export function ContactSection() {
  const { language } = useTranslation();
  const dict = getLandingDict(language);
  const message =
    language === "ar"
      ? "مرحباً، أرغب بالاستفسار عن تطبيق AI DriveX."
      : "Hi! I'd like to learn more about AI DriveX.";

  return (
    <MotionSection className="relative py-14 sm:py-20 lg:py-28" id="contact">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 right-10 h-[360px] w-[360px] rounded-full bg-emerald-500/15 blur-[130px]" />
        <div className="absolute -bottom-20 left-10 h-[360px] w-[360px] rounded-full bg-blue-500/20 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
            {dict.contactBadge}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {dict.contactTitle}{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {dict.contactTitleAccent}
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            {dict.contactSubtitle}
          </p>

          {/* Perks */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-300 sm:text-sm">
            <li className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-300" />
              {dict.contactPerk1}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-300" />
              {dict.contactPerk2}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Globe2 className="h-4 w-4 text-emerald-300" />
              {dict.contactPerk3}
            </li>
          </ul>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* WhatsApp card */}
          <motion.a
            href={whatsappLink(message)}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-emerald-700/10 p-8 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-2xl hover:shadow-emerald-500/20"
          >
            <div className="pointer-events-none absolute -top-20 -left-20 h-60 w-60 rounded-full bg-emerald-500/20 blur-[80px] transition-opacity duration-500 group-hover:opacity-80" />

            <div className="relative">
              <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <WhatsAppIcon className="h-7 w-7 text-white" />
              </span>

              <h3 className="mt-6 text-xl font-bold text-white sm:text-2xl">
                {dict.contactWhatsTitle}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                {dict.contactWhatsDesc}
              </p>

              <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all group-hover:scale-[1.03] group-hover:bg-emerald-400">
                <MessageCircle className="h-4 w-4" />
                {dict.contactWhatsCta}
              </span>
            </div>
          </motion.a>

          {/* Calendly card */}
          <motion.a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-slate-900/70 to-violet-700/10 p-8 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/20"
          >
            <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-violet-500/25 blur-[80px] transition-opacity duration-500 group-hover:opacity-80" />

            <div className="relative">
              <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-lg shadow-blue-500/30">
                <Calendar className="h-7 w-7 text-white" />
              </span>

              <h3 className="mt-6 text-xl font-bold text-white sm:text-2xl">
                {dict.contactBookTitle}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                {dict.contactBookDesc}
              </p>

              <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all group-hover:scale-[1.03] group-hover:shadow-violet-500/50">
                <Calendar className="h-4 w-4" />
                {dict.contactBookCta}
              </span>
            </div>
          </motion.a>
        </div>
      </div>
    </MotionSection>
  );
}
