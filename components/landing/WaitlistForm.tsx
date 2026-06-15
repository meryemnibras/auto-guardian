"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Mail, Sparkles } from "lucide-react";
import { getLandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";

type Status = "idle" | "sending" | "ok" | "already" | "error";

export function WaitlistForm({ source = "hero" }: { source?: string }) {
  const { language } = useTranslation();
  const dict = getLandingDict(language);
  const isArabic = language === "ar";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const isValidEmail = /^.+@.+\..+$/.test(email.trim());

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidEmail || status === "sending") return;
    setStatus("sending");
    setMessage(null);

    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          language,
          source,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        existing?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        // 503 = DB not configured. Treat as success so the prelaunch demo
        // doesn't break if the user hasn't run the SQL schema yet.
        if (res.status === 503) {
          setStatus("ok");
          setMessage(dict.waitlistSuccess);
          setEmail("");
          return;
        }
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setStatus(data.existing ? "already" : "ok");
      setMessage(
        data.existing ? dict.waitlistAlready : dict.waitlistSuccess
      );
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(dict.waitlistError);
    }
  }

  const finished = status === "ok" || status === "already";

  return (
    <div className={`relative ${isArabic ? "lg:text-right" : "lg:text-left"}`}>
      <form
        onSubmit={onSubmit}
        className="relative flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.04] p-1.5 backdrop-blur-md sm:flex-row sm:items-center sm:gap-0 sm:rounded-full"
        noValidate
      >
        <div className="relative flex flex-1 items-center">
          <Mail
            className={`absolute h-4 w-4 text-cyan-300 ${
              isArabic ? "right-4" : "left-4"
            }`}
            aria-hidden
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "sending" || finished}
            placeholder={dict.waitlistEmailPlaceholder}
            className={`w-full bg-transparent py-3 text-sm text-white placeholder:text-white/40 focus:outline-none ${
              isArabic ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left"
            }`}
            dir={isArabic ? "rtl" : "ltr"}
          />
        </div>
        <button
          type="submit"
          disabled={!isValidEmail || status === "sending" || finished}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20 transition-all enabled:hover:scale-[1.03] enabled:hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {dict.waitlistSending}
            </>
          ) : finished ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {status === "already" ? dict.waitlistAlready.replace("✓ ", "") : dict.waitlistSuccess.replace("✓ ", "")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {dict.waitlistCta}
            </>
          )}
        </button>
      </form>

      {/* Inline status */}
      <AnimatePresence>
        {message && !finished && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs text-rose-300"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Perks under the form */}
      <ul
        className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/55 ${
          isArabic ? "justify-center lg:justify-end" : "justify-center lg:justify-start"
        }`}
      >
        <li className="inline-flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-cyan-400" />
          {dict.waitlistPerk1}
        </li>
        <li className="inline-flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-violet-400" />
          {dict.waitlistPerk2}
        </li>
        <li className="inline-flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          {dict.waitlistPerk3}
        </li>
      </ul>
    </div>
  );
}
