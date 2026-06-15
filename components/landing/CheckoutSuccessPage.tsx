"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Sparkles,
  Mail,
  Smartphone,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { getLandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";

export function CheckoutSuccessPage() {
  const { language } = useTranslation();
  const dict = getLandingDict(language);
  const isArabic = language === "ar";
  const Arrow = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div className="relative min-h-screen scroll-smooth bg-slate-950 text-slate-100">
      <Navbar />

      <main className="relative pt-28 pb-20 sm:pt-36">
        {/* Atmospheric backgrounds */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-1/4 h-[460px] w-[460px] rounded-full bg-emerald-500/20 blur-[140px]" />
          <div className="absolute top-20 left-1/4 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[140px]" />
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[2rem] border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-cyan-500/10 p-8 text-center backdrop-blur-xl sm:p-12"
          >
            {/* glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/30 blur-[100px]" />

            {/* Big checkmark */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.15, type: "spring", bounce: 0.4 }}
              className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-400/20"
            >
              <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
            </motion.div>

            <h1 className="relative mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {isArabic ? "تم الدفع بنجاح! 🎉" : "Payment successful! 🎉"}
            </h1>

            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              {isArabic
                ? "أهلاً بكِ في عائلة AI Pro. حسابك مفعّل ويمكنك البدء فوراً، وقد أرسلنا الإيصال إلى بريدك."
                : "Welcome to the AI Pro family. Your account is active right now — we've also emailed you the receipt."}
            </p>

            {/* What happens next */}
            <div className="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <NextStep
                icon={<Mail className="h-4 w-4" />}
                title={isArabic ? "تحقّقي من بريدك" : "Check your inbox"}
                desc={isArabic ? "الإيصال + تأكيد الاشتراك" : "Receipt + confirmation"}
              />
              <NextStep
                icon={<Smartphone className="h-4 w-4" />}
                title={isArabic ? "حمّلي التطبيق" : "Download the app"}
                desc={isArabic ? "iOS و Android" : "iOS & Android"}
              />
              <NextStep
                icon={<Sparkles className="h-4 w-4" />}
                title={isArabic ? "ابدئي القيادة الذكية" : "Start driving smarter"}
                desc={isArabic ? "كل ميزات Pro متاحة" : "All Pro features unlocked"}
              />
            </div>

            {/* CTAs */}
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/40 ring-1 ring-white/20 transition-all hover:scale-[1.03] sm:w-auto"
              >
                {isArabic ? "افتحي حسابي" : "Open my account"}
                <Arrow className="h-4 w-4" />
              </Link>
              <Link
                href="/landing"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10 sm:w-auto"
              >
                {isArabic ? "الرجوع للصفحة الرئيسية" : "Back to home"}
              </Link>
            </div>

            <p className="relative mt-8 text-[11px] text-white/40">
              {isArabic
                ? "هل تحتاجين مساعدة؟ راسلينا على hi@aidrivex.com"
                : "Need help? Reach us at hi@aidrivex.com"}
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function NextStep({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur">
      <span className="inline-grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-md shadow-blue-500/30">
        {icon}
      </span>
      <p className="mt-3 text-sm font-bold text-white">{title}</p>
      <p className="mt-0.5 text-xs text-white/60">{desc}</p>
    </div>
  );
}
