"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Loader2, AlertCircle, RotateCcw, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/components/LanguageProvider";
import { useOfflineDB } from "@/hooks/useOfflineDB";
import { getRandomAcousticResult } from "@/lib/acousticResults";
import type {
  AcousticDiagnosisResult,
  RecordingStatus,
} from "@/types/mechanical";
import type { TranslationKey } from "@/types/i18n";
import { AnimatedWaveform } from "./AnimatedWaveform";
import { DiagnosisResultCard } from "./DiagnosisResultCard";

const RECORD_DURATION_MS = 5000;
const ANALYZE_DURATION_MS = 1200;

const STATUS_LABEL: Record<RecordingStatus, TranslationKey> = {
  idle: "statusIdle",
  "requesting-permission": "statusRequestingPermission",
  recording: "statusRecording",
  analyzing: "statusAnalyzing",
  completed: "statusCompleted",
  error: "scanError",
};

const STATUS_ICON: Record<RecordingStatus, LucideIcon> = {
  idle: Mic,
  "requesting-permission": Loader2,
  recording: Mic,
  analyzing: Loader2,
  completed: Mic,
  error: AlertCircle,
};

interface AcousticScannerProps {
  onSaved?: () => void;
}

export function AcousticScanner({ onSaved }: AcousticScannerProps = {}) {
  const { t } = useTranslation();
  const { add } = useOfflineDB();

  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [result, setResult] = useState<AcousticDiagnosisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState<boolean | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyzeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearTimers = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (analyzeTimerRef.current) {
      clearTimeout(analyzeTimerRef.current);
      analyzeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimers();
      if (
        recorderRef.current &&
        recorderRef.current.state !== "inactive"
      ) {
        try {
          recorderRef.current.stop();
        } catch {
          // ignore — recorder already in a terminal state
        }
      }
      stopStream();
      recorderRef.current = null;
    };
  }, [clearTimers, stopStream]);

  const persistResult = useCallback(
    async (diagnosis: AcousticDiagnosisResult): Promise<boolean> => {
      try {
        const id = await add("diagnostics", {
          result: `${diagnosis.title} — ${diagnosis.severity}`,
          date: new Date().toISOString(),
        });
        return id !== null;
      } catch {
        return false;
      }
    },
    [add]
  );

  const finishAnalysis = useCallback(async () => {
    const diagnosis = getRandomAcousticResult();
    const persisted = await persistResult(diagnosis);
    if (!mountedRef.current) return;
    setResult(diagnosis);
    setSaved(persisted);
    setStatus("completed");
    if (persisted) onSaved?.();
  }, [persistResult, onSaved]);

  const start = useCallback(async () => {
    setErrorMessage(null);
    setResult(null);
    setSaved(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setStatus("error");
      setErrorMessage(t("micNotSupported"));
      return;
    }
    if (
      typeof window === "undefined" ||
      typeof window.MediaRecorder === "undefined"
    ) {
      setStatus("error");
      setErrorMessage(t("micNotSupported"));
      return;
    }

    setStatus("requesting-permission");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      if (!mountedRef.current) return;
      const name = e instanceof DOMException ? e.name : "";
      setStatus("error");
      setErrorMessage(
        name === "NotAllowedError" || name === "SecurityError"
          ? t("micPermissionDenied")
          : t("scanError")
      );
      return;
    }

    if (!mountedRef.current) {
      stream.getTracks().forEach((tr) => tr.stop());
      return;
    }

    streamRef.current = stream;

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream);
    } catch {
      setStatus("error");
      setErrorMessage(t("scanError"));
      stopStream();
      return;
    }
    recorderRef.current = recorder;

    recorder.onstop = () => {
      stopStream();
      if (!mountedRef.current) return;
      setStatus("analyzing");
      analyzeTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        void finishAnalysis();
      }, ANALYZE_DURATION_MS);
    };

    try {
      recorder.start();
    } catch {
      setStatus("error");
      setErrorMessage(t("scanError"));
      stopStream();
      return;
    }

    setStatus("recording");
    stopTimerRef.current = setTimeout(() => {
      if (
        recorderRef.current &&
        recorderRef.current.state !== "inactive"
      ) {
        try {
          recorderRef.current.stop();
        } catch {
          // ignore
        }
      }
    }, RECORD_DURATION_MS);
  }, [t, stopStream, finishAnalysis]);

  const isBusy =
    status === "requesting-permission" ||
    status === "recording" ||
    status === "analyzing";
  const StatusIcon = STATUS_ICON[status];
  const spinIcon =
    status === "requesting-permission" || status === "analyzing";

  return (
    <section className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-5 shadow-lg">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-100">
          {t("acousticScanner")}
        </h2>
        <p className="text-xs text-gray-400">{t("acousticIntro")}</p>
      </header>

      <AnimatedWaveform active={status === "recording"} />

      <div className="flex items-center gap-2 text-sm text-gray-300">
        <StatusIcon
          className={`h-4 w-4 ${spinIcon ? "animate-spin" : ""} ${
            status === "error" ? "text-rose-400" : "text-blue-400"
          }`}
          aria-hidden
        />
        <span>{t(STATUS_LABEL[status])}</span>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="button"
        onClick={start}
        disabled={isBusy}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(99,102,241,0.6)] transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-400/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {status === "completed" || status === "error" ? (
          <RotateCcw className="h-4 w-4" aria-hidden />
        ) : (
          <Mic className="h-4 w-4" aria-hidden />
        )}
        {status === "completed" || status === "error"
          ? t("scanAgain")
          : t("startScan")}
      </button>

      <AnimatePresence mode="wait">
        {result && status === "completed" && (
          <motion.div
            key={result.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DiagnosisResultCard result={result} saved={saved} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
