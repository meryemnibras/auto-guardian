"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Check,
  RefreshCcw,
  CreditCard,
  Globe2,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { getLandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import {
  PRO_PRICE,
  VAT_RATE,
  CURRENCIES,
  CURRENCY_ORDER,
  formatPrice,
} from "@/lib/currency";

const PRO_FEATURES_AR = [
  "فحص صوتي للمحرك بلا حدود",
  "مستشار أعطال ذكي بالعربية",
  "وضع حارس المفاتيح المتقدم",
  "تنبيهات SOS فورية للطوارئ",
  "مزامنة سحابية عند الاتصال",
  "وصول مبكر لميزات AI القادمة",
];
const PRO_FEATURES_EN = [
  "Unlimited engine acoustic scans",
  "Smart fault advisor (Arabic & English)",
  "Advanced Key Guardian mode",
  "Real-time emergency SOS alerts",
  "Cloud sync when online",
  "Early access to upcoming AI features",
];

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function detectBrand(cardNumber: string): "visa" | "mastercard" | "amex" | "mada" | "unknown" {
  const n = cardNumber.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(440647|446404|446672|458456|484783)/.test(n)) return "mada";
  return "unknown";
}

function BrandLogo({ brand }: { brand: ReturnType<typeof detectBrand> }) {
  const base = "h-6 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider";
  if (brand === "visa") return <span className={`${base} bg-[#1A1F71] text-white`}>VISA</span>;
  if (brand === "mastercard")
    return (
      <span className={`${base} flex items-center gap-0.5 bg-white px-1.5 text-[#1A1F71]`}>
        <span className="block h-4 w-4 rounded-full bg-[#EB001B]" />
        <span className="-ml-2 block h-4 w-4 rounded-full bg-[#F79E1B]/90 mix-blend-multiply" />
      </span>
    );
  if (brand === "amex") return <span className={`${base} bg-[#006FCF] text-white`}>AMEX</span>;
  if (brand === "mada") return <span className={`${base} bg-emerald-500 text-white`}>MADA</span>;
  return <CreditCard className="h-5 w-5 text-white/50" />;
}

export function CheckoutPage() {
  const { language } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const dict = getLandingDict(language);
  const isArabic = language === "ar";
  const Arrow = isArabic ? ArrowRight : ArrowLeft;

  const features = isArabic ? PRO_FEATURES_AR : PRO_FEATURES_EN;

  const basePrice = PRO_PRICE[currency];
  const vatRate = VAT_RATE[currency];
  const vat = Math.round(basePrice * vatRate * 100) / 100;
  const total = basePrice + vat;
  const subtotalLabel = formatPrice(basePrice, currency, language);
  const vatLabel = formatPrice(vat, currency, language);
  const totalLabel = formatPrice(total, currency, language);
  const vatRowLabel = isArabic
    ? `ضريبة القيمة المضافة (${Math.round(vatRate * 100)}%)`
    : `VAT (${Math.round(vatRate * 100)}%)`;
  const payLabel = isArabic
    ? `ادفع ${totalLabel} الآن`
    : `Pay ${totalLabel} now`;

  // Form state
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(isArabic ? "السعودية" : "Saudi Arabia");
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const brand = useMemo(() => detectBrand(cardNumber), [cardNumber]);

  const isValid =
    name.trim().length > 1 &&
    cardNumber.replace(/\s/g, "").length >= 13 &&
    /^\d{2}\/\d{2}$/.test(expiry) &&
    cvv.length >= 3 &&
    /^.+@.+\..+$/.test(email) &&
    terms;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    // Demo: simulate processing
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1800);
  }

  return (
    <div className="relative min-h-screen scroll-smooth bg-slate-950 text-slate-100 selection:bg-blue-500/40 selection:text-white">
      <Navbar />

      <main className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-36">
        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-1/4 h-[480px] w-[480px] rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute top-20 left-1/4 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[140px]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/landing"
            className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-cyan-300"
          >
            <Arrow className="h-4 w-4" />
            {dict.checkoutBack}
          </Link>

          {/* Header */}
          <div className="mt-5 mb-8 max-w-2xl sm:mt-6 sm:mb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200 backdrop-blur">
              <Lock className="h-3.5 w-3.5" />
              {dict.checkoutSecure}
            </span>
            <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {dict.checkoutTitle}
            </h1>
            <p className="mt-2 text-sm text-slate-300 sm:mt-3 sm:text-lg">{dict.checkoutSubtitle}</p>
          </div>

          {success ? (
            <SuccessCard dict={dict} />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
              {/* Payment form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onSubmit={onSubmit}
                className="space-y-6 lg:col-span-3"
                noValidate
              >
                {/* === Currency selector === */}
                <Card>
                  <SectionHeader
                    icon={<Globe2 className="h-4 w-4" />}
                    title={isArabic ? "اختر عملة الدفع" : "Choose payment currency"}
                  />
                  <p className="mt-1 text-xs text-white/55">
                    {isArabic
                      ? "ادفع بعملتك المحلية — السعر مُعدَّل لكل سوق."
                      : "Pay in your local currency — pricing is adapted per market."}
                  </p>

                  <div
                    role="radiogroup"
                    aria-label="Currency"
                    className="mt-4 grid grid-cols-3 gap-3"
                  >
                    {CURRENCY_ORDER.map((c) => {
                      const cfg = CURRENCIES[c];
                      const active = c === currency;
                      const price = PRO_PRICE[c];
                      const vat = Math.round(price * VAT_RATE[c] * 100) / 100;
                      const tot = price + vat;
                      return (
                        <button
                          key={c}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setCurrency(c)}
                          className={`group relative overflow-hidden rounded-2xl p-4 text-center transition-all ${
                            active
                              ? "ring-2 ring-cyan-400/70"
                              : "ring-1 ring-white/10 hover:ring-white/25"
                          }`}
                        >
                          {/* Active background */}
                          {active && (
                            <span
                              aria-hidden
                              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-violet-500/15"
                            />
                          )}
                          <span
                            aria-hidden
                            className={`pointer-events-none absolute inset-0 transition-colors ${
                              active ? "" : "bg-slate-900/60 group-hover:bg-slate-900/80"
                            }`}
                          />

                          <span className="relative flex items-center justify-center gap-1.5 text-xl leading-none">
                            <span>{cfg.flag}</span>
                          </span>
                          <span className="relative mt-2 block text-xs font-bold tracking-wider text-white/85">
                            {c}
                          </span>
                          <span
                            className={`relative mt-1.5 block text-base font-extrabold ${
                              active
                                ? "bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent"
                                : "text-white"
                            }`}
                          >
                            {formatPrice(tot, c, language)}
                          </span>
                          <span className="relative mt-0.5 block text-[10px] text-white/55">
                            {cfg.name[isArabic ? "ar" : "en"]}
                          </span>

                          {active && (
                            <span className="absolute end-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-cyan-400 shadow-md shadow-cyan-500/50">
                              <Check className="h-3 w-3 text-slate-950" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* === Card section === */}
                <Card>
                  <SectionHeader
                    icon={<CreditCard className="h-4 w-4" />}
                    title={dict.checkoutCardSection}
                  />

                  {/* Visual card preview */}
                  <CardPreview
                    name={name}
                    cardNumber={cardNumber}
                    expiry={expiry}
                    brand={brand}
                  />

                  <div className="mt-6 space-y-4">
                    <Field label={dict.checkoutCardholderName}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value.toUpperCase())}
                        placeholder={dict.checkoutCardholderPlaceholder}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm font-semibold tracking-wider text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                      />
                    </Field>

                    <Field label={dict.checkoutCardNumber}>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 pr-16 text-sm font-mono tracking-widest text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                          dir="ltr"
                        />
                        <span className="absolute end-3 top-1/2 -translate-y-1/2">
                          <BrandLogo brand={brand} />
                        </span>
                      </div>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label={dict.checkoutCardExpiry}>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm font-mono tracking-widest text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                          dir="ltr"
                        />
                      </Field>
                      <Field label={dict.checkoutCardCvv}>
                        <input
                          type="password"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                          }
                          placeholder="•••"
                          className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm font-mono tracking-widest text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                          dir="ltr"
                        />
                      </Field>
                    </div>
                  </div>
                </Card>

                {/* === Billing section === */}
                <Card>
                  <SectionHeader
                    icon={<ShieldCheck className="h-4 w-4" />}
                    title={dict.checkoutBillingSection}
                  />

                  <div className="mt-5 space-y-4">
                    <Field label={dict.checkoutEmail}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={dict.checkoutEmailPlaceholder}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                        dir="ltr"
                      />
                    </Field>
                    <Field label={dict.checkoutCountry}>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                      >
                        {(isArabic
                          ? [
                              "السعودية",
                              "الإمارات",
                              "الكويت",
                              "قطر",
                              "البحرين",
                              "عُمان",
                              "مصر",
                              "الأردن",
                              "المغرب",
                              "الجزائر",
                              "تونس",
                            ]
                          : [
                              "Saudi Arabia",
                              "United Arab Emirates",
                              "Kuwait",
                              "Qatar",
                              "Bahrain",
                              "Oman",
                              "Egypt",
                              "Jordan",
                              "Morocco",
                              "Algeria",
                              "Tunisia",
                            ]
                        ).map((c) => (
                          <option key={c} value={c} className="bg-slate-900">
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </Card>

                {/* Terms checkbox */}
                <label className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur transition-colors hover:border-white/20">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-cyan-500"
                  />
                  <span className="text-xs leading-relaxed text-white/75">
                    {dict.checkoutTerms}
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/40 ring-1 ring-white/20 transition-all enabled:hover:scale-[1.01] enabled:hover:shadow-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{dict.checkoutProcessing}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>{payLabel}</span>
                    </>
                  )}
                </button>

                {/* Demo note */}
                <p className="text-center text-[11px] text-white/40">{dict.checkoutDemoNote}</p>
              </motion.form>

              {/* Order summary */}
              <motion.aside
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-2"
              >
                <div className="sticky top-28 space-y-4">
                  <Card highlight>
                    <SectionHeader
                      icon={<Sparkles className="h-4 w-4" />}
                      title={dict.checkoutSummaryTitle}
                    />

                    <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-950/50 via-slate-900/60 to-violet-950/50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-white">{dict.checkoutSummaryPlan}</p>
                          <p className="mt-0.5 text-xs text-white/60">{dict.checkoutSummaryBilled}</p>
                        </div>
                        <span className="rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-3 py-1 text-[10px] font-bold text-white shadow-md shadow-blue-500/30">
                          PRO
                        </span>
                      </div>

                      <ul className="mt-4 space-y-2">
                        {features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-white/85">
                            <span className="mt-0.5 grid h-4 w-4 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                      <Row label={dict.checkoutSummarySubtotal} value={subtotalLabel} />
                      {vatRate > 0 && <Row label={vatRowLabel} value={vatLabel} />}
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                      <span className="text-sm text-white/70">{dict.checkoutSummaryTotal}</span>
                      <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                        {totalLabel}
                      </span>
                    </div>
                  </Card>

                  {/* Trust badges */}
                  <ul className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
                    <TrustItem icon={<Lock className="h-3.5 w-3.5" />} text={dict.checkoutTrustEncrypted} />
                    <TrustItem icon={<RefreshCcw className="h-3.5 w-3.5" />} text={dict.checkoutTrustCancel} />
                    <TrustItem icon={<ShieldCheck className="h-3.5 w-3.5" />} text={dict.checkoutTrustRefund} />
                  </ul>

                  <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-center text-xs leading-relaxed text-emerald-200/90">
                    {dict.checkoutMoneyBack}
                  </p>
                </div>
              </motion.aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Card({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="relative">
      {highlight && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-cyan-400/50 via-blue-500/40 to-violet-500/50 opacity-60"
        />
      )}
      <div className="relative rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl sm:p-6">
        {children}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-md shadow-blue-500/30">
        {icon}
      </span>
      <h2 className="text-base font-bold text-white">{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/60">
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/65">{label}</span>
      <span className="font-semibold text-white/90">{value}</span>
    </div>
  );
}

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-2 text-xs text-white/75">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
        {icon}
      </span>
      {text}
    </li>
  );
}

/* ---------------- visual card preview ---------------- */

function CardPreview({
  name,
  cardNumber,
  expiry,
  brand,
}: {
  name: string;
  cardNumber: string;
  expiry: string;
  brand: ReturnType<typeof detectBrand>;
}) {
  const displayed = (cardNumber || "•••• •••• •••• ••••").padEnd(19, " ");
  return (
    <div className="mt-5 select-none">
      <div className="relative aspect-[1.6/1] w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 p-5 shadow-2xl shadow-blue-500/20 ring-1 ring-white/10">
        {/* shine */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

        {/* top row */}
        <div className="relative flex items-start justify-between" dir="ltr">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            AI DriveX
          </span>
          <BrandLogo brand={brand} />
        </div>

        {/* chip */}
        <div className="relative mt-6 h-7 w-10 rounded bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-700 shadow-inner" />

        {/* number */}
        <p
          className="relative mt-4 font-mono text-lg tracking-[0.18em] text-white sm:text-xl"
          dir="ltr"
        >
          {displayed}
        </p>

        {/* bottom row */}
        <div className="relative mt-4 flex items-end justify-between gap-3" dir="ltr">
          <div>
            <p className="text-[8px] uppercase tracking-wider text-white/40">CARDHOLDER</p>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              {name || "YOUR NAME"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase tracking-wider text-white/40">EXP</p>
            <p className="font-mono text-xs font-bold text-white">{expiry || "MM/YY"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- success card ---------------- */

function SuccessCard({ dict }: { dict: ReturnType<typeof getLandingDict> }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-lg"
    >
      <div className="relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-cyan-500/10 p-10 text-center backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-emerald-500/30 blur-[80px]" />
        <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-xl shadow-emerald-500/30">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </span>
        <h2 className="relative mt-6 text-2xl font-extrabold text-white sm:text-3xl">
          {dict.checkoutSuccessTitle}
        </h2>
        <p className="relative mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
          {dict.checkoutSuccessDesc}
        </p>
        <Link
          href="/landing"
          className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20 transition-all hover:scale-[1.03]"
        >
          {dict.checkoutBack}
        </Link>
      </div>
    </motion.div>
  );
}
