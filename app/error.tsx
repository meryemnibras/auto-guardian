"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Catches uncaught errors in the route tree and shows a friendly recovery UI
 * instead of a blank screen or a stack trace.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in dev console; in production, downstream telemetry
    // (when wired) would receive it here.
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-[0_12px_36px_-12px_rgba(244,63,94,0.6)]">
        <AlertTriangle className="h-8 w-8" aria-hidden />
      </span>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">
          حدث خطأ غير متوقّع
        </h1>
        <p className="text-sm text-slate-400">
          نعتذر — حدث خلل بصري في التطبيق. بياناتك المحلية محفوظة بأمان في
          متصفّحك.
        </p>
      </div>

      {error.digest && (
        <p className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-[10px] font-mono text-slate-500">
          ID: {error.digest}
        </p>
      )}

      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.55)] transition-transform active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          إعادة المحاولة
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-200 transition-colors hover:border-slate-700 active:scale-[0.98]"
        >
          <Home className="h-4 w-4" aria-hidden />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
