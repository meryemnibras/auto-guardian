"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Wrench,
  AlertCircle,
  Sparkles,
  Loader2,
  Database,
  Bot,
  Beaker,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { getFaultCodeExplanation, KNOWN_FAULT_CODES } from "@/lib/faultCodes";
import type {
  FaultCodeExplanation,
  FaultUrgency,
} from "@/types/mechanical";
import type { TranslationKey } from "@/types/i18n";

const URGENCY_STYLE: Record<
  FaultUrgency,
  { badge: string; labelKey: TranslationKey }
> = {
  low: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    labelKey: "urgencyLow",
  },
  medium: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    labelKey: "urgencyMedium",
  },
  high: {
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    labelKey: "urgencyHigh",
  },
};

type ExplanationSource = "local" | "ai-anthropic" | "ai-gemini" | "mock";

const SOURCE_STYLE: Record<
  ExplanationSource,
  { badge: string; labelKey: TranslationKey; Icon: typeof Database }
> = {
  local: {
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    labelKey: "localSourceBadge",
    Icon: Database,
  },
  "ai-anthropic": {
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    labelKey: "aiSourceBadge",
    Icon: Bot,
  },
  "ai-gemini": {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    labelKey: "aiSourceBadge",
    Icon: Bot,
  },
  mock: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    labelKey: "mockSourceBadge",
    Icon: Beaker,
  },
};

interface ResolvedExplanation {
  source: ExplanationSource;
  explanation: FaultCodeExplanation;
}

type QueryState =
  | { kind: "idle" }
  | { kind: "resolved"; data: ResolvedExplanation }
  | { kind: "not-found"; code: string }
  | { kind: "ai-loading"; code: string }
  | { kind: "ai-error"; code: string };

interface ApiExplainResponse {
  source: ExplanationSource;
  explanation: FaultCodeExplanation;
}

export function MaintenanceAdvisor() {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [state, setState] = useState<QueryState>({ kind: "idle" });

  function lookup(raw: string) {
    const normalized = raw.trim().toUpperCase();
    const local = getFaultCodeExplanation(normalized);
    if (local) {
      setState({ kind: "resolved", data: { source: "local", explanation: local } });
    } else {
      setState({ kind: "not-found", code: normalized });
    }
  }

  async function askAI(targetCode: string) {
    setState({ kind: "ai-loading", code: targetCode });
    try {
      const response = await fetch("/api/explain-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: targetCode }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as ApiExplainResponse;
      setState({
        kind: "resolved",
        data: { source: data.source, explanation: data.explanation },
      });
    } catch {
      setState({ kind: "ai-error", code: targetCode });
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    lookup(code);
  }

  function useExample(example: string) {
    setCode(example);
    lookup(example);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-5 shadow-lg">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-100">
          {t("maintenanceAdvisor")}
        </h2>
        <p className="text-xs text-gray-400">{t("maintenanceIntro")}</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-2">
        <label className="block text-xs text-gray-400">
          <span className="sr-only">{t("enterFaultCode")}</span>
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              aria-hidden
            />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("enterFaultCode")}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 px-9 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={!code.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(99,102,241,0.6)] transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-400/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          <Wrench className="h-4 w-4" aria-hidden />
          {t("explainCode")}
        </button>
      </form>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wider text-gray-500">
          {t("examples")}
        </div>
        <div className="flex flex-wrap gap-2">
          {KNOWN_FAULT_CODES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => useExample(c)}
              className="rounded-full border border-gray-800 bg-gray-950 px-3 py-1 text-xs font-medium text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-300"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state.kind === "resolved" && (
          <ResolvedCard
            key={`r-${state.data.explanation.code}-${state.data.source}`}
            data={state.data}
          />
        )}

        {state.kind === "not-found" && (
          <NotFoundCard
            key={`nf-${state.code}`}
            code={state.code}
            onAskAI={() => askAI(state.code)}
          />
        )}

        {state.kind === "ai-loading" && (
          <motion.div
            key={`load-${state.code}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3 text-xs text-violet-200"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span>
              {t("aiThinking")}{" "}
              <span className="font-mono opacity-80">{state.code}</span>
            </span>
          </motion.div>
        )}

        {state.kind === "ai-error" && (
          <motion.div
            key={`err-${state.code}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{t("aiCallFailed")}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ResolvedCard({ data }: { data: ResolvedExplanation }) {
  const { t } = useTranslation();
  const exp = data.explanation;
  const urgency = URGENCY_STYLE[exp.urgency];
  const source = SOURCE_STYLE[data.source];
  const SourceIcon = source.Icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-3 rounded-2xl border border-gray-800 bg-gray-950/60 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-blue-300">
            <span>{exp.code}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 normal-case ${source.badge}`}
            >
              <SourceIcon className="h-3 w-3" aria-hidden />
              {t(source.labelKey)}
            </span>
          </div>
          <h3 className="mt-1 text-sm font-semibold text-gray-100">
            {exp.title}
          </h3>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${urgency.badge}`}
        >
          {t("urgency")} · {t(urgency.labelKey)}
        </span>
      </div>

      <Section title={t("humanExplanation")}>{exp.humanExplanation}</Section>
      <Section title={t("recommendedAction")}>{exp.recommendedAction}</Section>
    </motion.article>
  );
}

function NotFoundCard({
  code,
  onAskAI,
}: {
  code: string;
  onAskAI: () => void;
}) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="status"
      className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3"
    >
      <div className="flex items-start gap-2 text-xs text-amber-200">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          <span className="font-semibold">{code}</span> — {t("codeNotFound")}
        </span>
      </div>
      <button
        type="button"
        onClick={onAskAI}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(167,139,250,0.6)] transition-transform hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-400/60"
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        {t("askAI")}
      </button>
    </motion.div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-gray-200">{children}</p>
    </div>
  );
}
