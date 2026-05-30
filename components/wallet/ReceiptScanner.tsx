"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Camera, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { extractReceiptAmount } from "@/lib/receiptOcr";

interface ReceiptScannerProps {
  onAmountExtracted: (amount: number) => void;
}

type ScanState =
  | { kind: "idle" }
  | { kind: "scanning" }
  | { kind: "success"; amount: number; confidence: number; rawText: string }
  | { kind: "failed"; rawText: string };

export function ReceiptScanner({ onAmountExtracted }: ReceiptScannerProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ScanState>({ kind: "idle" });

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setState({ kind: "scanning" });
    try {
      const { amount, rawText, confidence } = await extractReceiptAmount(file);
      if (amount !== null && amount > 0) {
        onAmountExtracted(amount);
        setState({ kind: "success", amount, confidence, rawText });
      } else {
        setState({ kind: "failed", rawText });
      }
    } catch {
      setState({ kind: "failed", rawText: "" });
    } finally {
      // Reset input so picking the same file again still fires onChange.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function trigger() {
    inputRef.current?.click();
  }

  const scanning = state.kind === "scanning";

  return (
    <section className="space-y-3 rounded-3xl border border-gray-800 bg-gray-950/70 p-5 shadow-lg backdrop-blur">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        className="hidden"
        aria-hidden
      />

      <button
        type="button"
        onClick={trigger}
        disabled={scanning}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-4 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(99,102,241,0.7)] transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      >
        {scanning ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            {t("analyzingReceipt")}
          </>
        ) : (
          <>
            <Camera className="h-5 w-5" aria-hidden />
            {t("scanReceipt")}
          </>
        )}
      </button>

      <p className="text-[11px] text-gray-500">{t("manualEntryHint")}</p>

      {state.kind === "success" && (
        <div className="space-y-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {t("ocrSuccess")}
          </div>
          <div className="flex items-center justify-between text-emerald-100">
            <span>{t("amountLabel")}</span>
            <span className="font-bold">{state.amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300/80">
            <span>{t("ocrConfidence")}</span>
            <span>{Math.round(state.confidence * 100)}%</span>
          </div>
          <details className="mt-1 text-[11px] text-emerald-200/80">
            <summary className="cursor-pointer">{t("rawTextLabel")}</summary>
            <pre className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-emerald-950/40 p-2 text-emerald-100/80">
              {state.rawText}
            </pre>
          </details>
        </div>
      )}

      {state.kind === "failed" && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{t("ocrFailed")}</span>
        </div>
      )}
    </section>
  );
}
