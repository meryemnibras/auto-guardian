"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  Siren,
  ShieldCheck,
  ShieldQuestion,
  ShieldOff,
  Activity,
  Play,
  Square,
  Zap,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { useShakeDetection } from "@/hooks/useShakeDetection";
import { useSOSCountdown } from "@/hooks/useSOSCountdown";
import { buildSMSUrl, buildSOSMessage } from "@/lib/sos";
import { PermissionNotice } from "./PermissionNotice";
import { SOSCountdownOverlay } from "./SOSCountdownOverlay";
import type {
  MotionPermissionStatus,
  SavedParkingLocation,
} from "@/types/emergency";
import type { TranslationKey } from "@/types/i18n";

interface SOSPanelProps {
  parking: SavedParkingLocation | null;
}

const STATUS_LABEL: Record<MotionPermissionStatus, TranslationKey> = {
  unknown: "motionIdle",
  granted: "motionGranted",
  denied: "motionDenied",
  unsupported: "motionUnsupported",
  "requires-permission": "motionRequiresPermission",
};

function vibrate(pattern: number[]) {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // some browsers throw if user has not interacted yet
  }
}

export function SOSPanel({ parking }: SOSPanelProps) {
  const { t } = useTranslation();
  const parkingRef = useRef(parking);
  parkingRef.current = parking;

  const onComplete = useCallback(() => {
    vibrate([200]);
    const coords = parkingRef.current
      ? { lat: parkingRef.current.lat, lng: parkingRef.current.lng }
      : null;
    const message = buildSOSMessage(coords, {
      prefix: t("sosAlarmTitle") + ": " + t("sosPanelIntro"),
      noLocationNote: t("noParkingSaved"),
    });
    if (typeof window !== "undefined") {
      window.location.href = buildSMSUrl(message);
    }
  }, [t]);

  const countdown = useSOSCountdown({ durationSeconds: 10, onComplete });

  const triggerCountdown = useCallback(() => {
    vibrate([300, 150, 300, 150, 600]);
    countdown.start();
  }, [countdown]);

  const shake = useShakeDetection({ onShakeDetected: triggerCountdown });

  const isUnsupported = shake.permissionStatus === "unsupported";
  const needsPermission = shake.permissionStatus === "requires-permission";
  const isDenied = shake.permissionStatus === "denied";

  useEffect(() => {
    // If the user navigates away while listening, the hook itself cleans up.
    // Nothing else to do here.
  }, []);

  return (
    <section className="space-y-4 rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 to-gray-950/70 p-5 shadow-[0_18px_50px_-18px_rgba(244,63,94,0.45)] backdrop-blur">
      <header className="flex items-center gap-2">
        <Siren className="h-5 w-5 text-rose-300" aria-hidden />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
          {t("sosPanelTitle")}
        </h2>
      </header>
      <p className="text-xs text-slate-600 dark:text-gray-400">{t("sosPanelIntro")}</p>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950/60 px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-slate-700 dark:text-gray-300">
          {isUnsupported || isDenied ? (
            <ShieldOff className="h-4 w-4 text-rose-400" aria-hidden />
          ) : shake.isListening ? (
            <Activity className="h-4 w-4 animate-pulse text-emerald-400" aria-hidden />
          ) : needsPermission ? (
            <ShieldQuestion className="h-4 w-4 text-amber-400" aria-hidden />
          ) : (
            <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden />
          )}
          <span>{t("motionSensorStatus")}</span>
        </div>
        <span className="text-xs text-slate-600 dark:text-gray-400">
          {shake.isListening ? t("motionListening") : t(STATUS_LABEL[shake.permissionStatus])}
        </span>
      </div>

      {isUnsupported && (
        <PermissionNotice description={t("motionUnsupported")} tone="warning" />
      )}
      {isDenied && (
        <PermissionNotice description={t("motionDenied")} tone="error" />
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {needsPermission && (
          <button
            type="button"
            onClick={() => void shake.requestMotionPermission()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(245,158,11,0.55)] transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-300/60"
          >
            <ShieldQuestion className="h-4 w-4" aria-hidden />
            {t("requestMotionPermission")}
          </button>
        )}
        {!isUnsupported && !needsPermission && !isDenied && (
          <button
            type="button"
            onClick={shake.isListening ? shake.stopListening : shake.startListening}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 ${
              shake.isListening
                ? "bg-gray-800 ring-gray-500/40 hover:bg-gray-700"
                : "bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] ring-emerald-400/60"
            }`}
          >
            {shake.isListening ? (
              <>
                <Square className="h-4 w-4" aria-hidden />
                {t("disableShakeDetection")}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" aria-hidden />
                {t("enableShakeDetection")}
              </>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={triggerCountdown}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(244,63,94,0.6)] transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-300/60"
        >
          <Zap className="h-4 w-4" aria-hidden />
          {t("triggerSosManually")}
        </button>
      </div>

      <PermissionNotice description={t("disclaimerExperimental")} tone="info" />

      {countdown.isActive && (
        <SOSCountdownOverlay
          remainingSeconds={countdown.remainingSeconds}
          onCancel={countdown.cancel}
        />
      )}
    </section>
  );
}
