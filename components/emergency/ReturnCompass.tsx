"use client";

import { useEffect, useMemo } from "react";
import { Car, Navigation, Loader2, Play, Square } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { useCurrentPosition } from "@/hooks/useCurrentPosition";
import { calculateDistanceMeters, formatDistance } from "@/lib/geo";
import { PermissionNotice } from "./PermissionNotice";
import type {
  GeolocationErrorCode,
  SavedParkingLocation,
} from "@/types/emergency";
import type { TranslationKey } from "@/types/i18n";

interface ReturnCompassProps {
  parking: SavedParkingLocation | null;
}

const ERROR_KEY: Record<GeolocationErrorCode, TranslationKey> = {
  "permission-denied": "locationPermissionDenied",
  unavailable: "locationUnavailable",
  timeout: "locationTimeout",
  unsupported: "locationUnsupported",
};

export function ReturnCompass({ parking }: ReturnCompassProps) {
  const { t } = useTranslation();
  const { position, status, error, startWatching, stopWatching } =
    useCurrentPosition();

  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  const distanceMeters = useMemo(() => {
    if (!parking || !position) return null;
    return calculateDistanceMeters(
      { lat: position.lat, lng: position.lng },
      { lat: parking.lat, lng: parking.lng }
    );
  }, [parking, position]);

  const isWatching = status === "watching";
  const distanceLabel = distanceMeters !== null ? formatDistance(distanceMeters) : null;

  return (
    <section className="space-y-4 rounded-3xl border border-gray-800 bg-gray-950/70 p-5 shadow-lg backdrop-blur">
      <header className="flex items-center gap-2">
        <Navigation className="h-5 w-5 text-cyan-300" aria-hidden />
        <h2 className="text-lg font-semibold text-gray-100">
          {t("returnCompassTitle")}
        </h2>
      </header>
      <p className="text-xs text-gray-400">{t("returnCompassIntro")}</p>

      {!parking && <PermissionNotice description={t("noCarToTrack")} tone="info" />}

      {parking && (
        <>
          <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
            <div
              aria-hidden
              className={`absolute inset-0 rounded-full border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-violet-500/5 ${
                isWatching ? "animate-pulse" : ""
              }`}
            />
            <div
              aria-hidden
              className="absolute inset-4 rounded-full border border-cyan-500/15"
            />
            <div
              aria-hidden
              className="absolute inset-8 rounded-full border border-dashed border-cyan-500/15"
            />
            <span
              aria-hidden
              className="absolute top-3 grid h-9 w-9 place-items-center rounded-full bg-cyan-500/15 text-cyan-300"
            >
              <Car className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                {t("distanceToCar")}
              </span>
              <span className="mt-1 text-3xl font-extrabold text-cyan-200">
                {distanceLabel ?? "—"}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {position ? t("youAreHere") : t("waitingForUserLocation")}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {!isWatching ? (
              <button
                type="button"
                onClick={startWatching}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(34,211,238,0.5)] transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
              >
                <Play className="h-4 w-4" aria-hidden />
                {t("startTracking")}
              </button>
            ) : (
              <button
                type="button"
                onClick={stopWatching}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-700 bg-gray-900 px-4 text-sm font-semibold text-gray-100 transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-500/40"
              >
                <Square className="h-4 w-4" aria-hidden />
                {t("stopTracking")}
              </button>
            )}
            {isWatching && (
              <span className="inline-flex items-center gap-1 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs text-emerald-300">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                {t("trackingActive")}
              </span>
            )}
          </div>

          {error && (
            <PermissionNotice
              description={t(ERROR_KEY[error])}
              tone={error === "permission-denied" ? "error" : "warning"}
            />
          )}
        </>
      )}
    </section>
  );
}
