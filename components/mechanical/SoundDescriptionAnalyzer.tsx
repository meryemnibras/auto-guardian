"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ear, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { useOfflineDB } from "@/hooks/useOfflineDB";
import { DiagnosisResultCard } from "./DiagnosisResultCard";
import type { AcousticDiagnosisResult } from "@/types/mechanical";
import type { TranslationKey } from "@/types/i18n";

type Source = "ai-anthropic" | "ai-gemini" | "mock";

interface AnalysisResponse {
  source: Source;
  result: AcousticDiagnosisResult;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; source: Source; result: AcousticDiagnosisResult; saved: boolean | null }
  | { kind: "error"; message: string };

const SOURCE_LABEL: Record<Source, TranslationKey> = {
  "ai-anthropic": "aiSourceBadge",
  "ai-gemini": "aiSourceBadge",
  mock: "mockSourceBadge",
};

const MIN_LEN = 8;
const MAX_LEN = 600;

interface SoundDescriptionAnalyzerProps {
  onSaved?: () => void;
}

export function SoundDescriptionAnalyzer({
  onSaved,
}: SoundDescriptionAnalyzerProps = {}) {
  const { t } = useTranslation();
  const { add } = useOfflineDB();
  const [description, setDescription] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = description.trim();
    if (text.length < MIN_LEN) return;

    setState({ kind: "loading" });
    try {
      const response = await fetch("/api/analyze-sound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as AnalysisResponse;

      // Persist to local diagnostics journal (same shape as Phase 2).
      let saved = false;
      try {
        const id = await add("diagnostics", {
          result: `${data.result.title} — ${data.result.severity}`,
          date: new Date().toISOString(),
        });
        saved = id !== null;
      } catch {
        saved = false;
      }

      setState({
        kind: "result",
        source: data.source,
        result: data.result,
        saved,
      });
      if (saved) onSaved?.();
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const remaining = MAX_LEN - description.length;

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-5 shadow-lg">
      <header className="flex items-start gap-2">
        <Ear className="mt-0.5 h-5 w-5 text-cyan-300" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
            {t("soundDescTitle")}
          </h2>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-gray-400">{t("soundDescIntro")}</p>
        </div>
      </header>

      <form onSubmit={onSubmit} className="space-y-2">
        <label className="block">
          <span className="sr-only">{t("soundDescPlaceholder")}</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, MAX_LEN))}
            placeholder={t("soundDescPlaceholder")}
            rows={4}
            dir="auto"
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 px-3 py-2.5 text-sm text-slate-900 dark:text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
          />
        </label>
        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-gray-500">
          <span>
            {description.length}/{MAX_LEN}
          </span>
          {description.length > 0 && description.length < MIN_LEN && (
            <span className="text-amber-400">{t("soundDescTooShort")}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={description.trim().length < MIN_LEN || state.kind === "loading"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(34,211,238,0.55)] transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {state.kind === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden />
          )}
          {state.kind === "loading"
            ? t("aiThinking")
            : t("analyzeSoundButton")}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {state.kind === "result" && (
          <motion.div
            key={`r-${state.result.title}-${state.source}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2 py-0.5 text-[11px] font-medium text-cyan-300">
                {t(SOURCE_LABEL[state.source])}
              </span>
            </div>
            <DiagnosisResultCard result={state.result} saved={state.saved} />
          </motion.div>
        )}

        {state.kind === "error" && (
          <motion.div
            key={`err-${state.message}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{state.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
