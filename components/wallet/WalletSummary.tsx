"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, AlertCircle, FileText } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { useOfflineDB } from "@/hooks/useOfflineDB";
import type { TranslationKey } from "@/types/i18n";

type Source = "ai-anthropic" | "ai-gemini" | "mock" | "empty";

interface SummaryResponse {
  source: Source;
  summary: string;
  total: number;
  topCategory: string | null;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; data: SummaryResponse }
  | { kind: "error"; message: string };

const SOURCE_LABEL: Record<Source, TranslationKey> = {
  "ai-anthropic": "aiSourceBadge",
  "ai-gemini": "aiSourceBadge",
  mock: "mockSourceBadge",
  empty: "noTransactionsYet",
};

const SOURCE_STYLE: Record<Source, string> = {
  "ai-anthropic": "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "ai-gemini": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  mock: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  empty: "bg-gray-500/15 text-gray-300 border-gray-500/30",
};

export function WalletSummary() {
  const { t } = useTranslation();
  const { get } = useOfflineDB();
  const [state, setState] = useState<State>({ kind: "idle" });

  const generate = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const expenses = await get("expenses");
      const payload = expenses.map((e) => ({
        amount: e.amount,
        category: e.category,
        date: e.date,
      }));
      const response = await fetch("/api/wallet-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenses: payload }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as SummaryResponse;
      setState({ kind: "result", data });
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }, [get]);

  return (
    <section className="space-y-4 rounded-3xl border border-gray-800 bg-gray-950/70 p-5 shadow-lg backdrop-blur">
      <header className="flex items-start gap-2">
        <FileText className="mt-0.5 h-5 w-5 text-violet-300" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            {t("walletSummaryTitle")}
          </h2>
          <p className="mt-0.5 text-xs text-gray-400">
            {t("walletSummaryIntro")}
          </p>
        </div>
      </header>

      <button
        type="button"
        onClick={generate}
        disabled={state.kind === "loading"}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(167,139,250,0.55)] transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-400/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      >
        {state.kind === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden />
        )}
        {state.kind === "loading" ? t("aiThinking") : t("generateSummary")}
      </button>

      <AnimatePresence mode="wait">
        {state.kind === "result" && (
          <motion.article
            key={`r-${state.data.source}-${state.data.total}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 rounded-2xl border border-gray-800 bg-gray-900/60 p-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${
                  SOURCE_STYLE[state.data.source]
                }`}
              >
                {t(SOURCE_LABEL[state.data.source])}
              </span>
              {state.data.total > 0 && (
                <span className="text-gray-500">
                  {state.data.total.toFixed(2)} ·{" "}
                  <span className="text-gray-300">{state.data.topCategory}</span>
                </span>
              )}
            </div>
            <p
              dir="auto"
              className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200"
            >
              {state.data.summary}
            </p>
          </motion.article>
        )}

        {state.kind === "error" && (
          <motion.div
            key={`err-${state.message}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{state.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
