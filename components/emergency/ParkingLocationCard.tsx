"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MapPin,
  Save,
  RefreshCw,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { useOfflineDB } from "@/hooks/useOfflineDB";
import { useCurrentPosition } from "@/hooks/useCurrentPosition";
import { createMapsLink } from "@/lib/geo";
import { PermissionNotice } from "./PermissionNotice";
import type {
  GeolocationErrorCode,
  SavedParkingLocation,
} from "@/types/emergency";
import type { LocationRecord } from "@/types/db";
import type { TranslationKey } from "@/types/i18n";

interface ParkingLocationCardProps {
  refreshKey: number;
  onSaved: () => void;
}

const ERROR_KEY: Record<GeolocationErrorCode, TranslationKey> = {
  "permission-denied": "locationPermissionDenied",
  unavailable: "locationUnavailable",
  timeout: "locationTimeout",
  unsupported: "locationUnsupported",
};

function toSaved(record: LocationRecord): SavedParkingLocation {
  return {
    id: record.id,
    lat: record.lat,
    lng: record.lng,
    timestamp: record.timestamp,
  };
}

export function ParkingLocationCard({
  refreshKey,
  onSaved,
}: ParkingLocationCardProps) {
  const { t, language } = useTranslation();
  const { add, get, remove } = useOfflineDB();
  const { getCurrentPositionOnce, error: geoError } = useCurrentPosition();
  const [latest, setLatest] = useState<SavedParkingLocation | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadLatest = useCallback(async () => {
    const data = await get("location");
    if (data.length === 0) {
      setLatest(null);
      return;
    }
    const sorted = [...data].sort((a, b) => b.timestamp - a.timestamp);
    setLatest(toSaved(sorted[0]));
  }, [get]);

  useEffect(() => {
    void loadLatest();
  }, [loadLatest, refreshKey]);

  async function onSave() {
    setSaveFailed(false);
    setSaving(true);
    const snap = await getCurrentPositionOnce();
    if (!snap) {
      setSaving(false);
      return;
    }
    const id = await add("location", {
      lat: snap.lat,
      lng: snap.lng,
      timestamp: Date.now(),
    });
    setSaving(false);
    if (id === null) {
      setSaveFailed(true);
      return;
    }
    await loadLatest();
    onSaved();
  }

  async function onDelete() {
    if (latest?.id == null) return;
    await remove("location", latest.id);
    await loadLatest();
    onSaved();
  }

  async function onCopy() {
    if (!latest) return;
    try {
      await navigator.clipboard?.writeText(
        `${latest.lat.toFixed(5)}, ${latest.lng.toFixed(5)}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  const formatter = new Intl.DateTimeFormat(language === "ar" ? "ar" : language, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="space-y-4 rounded-3xl border border-gray-800 bg-gray-950/70 p-5 shadow-lg backdrop-blur">
      <header className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-emerald-300" aria-hidden />
        <h2 className="text-lg font-semibold text-gray-100">
          {t("parkingTitle")}
        </h2>
      </header>
      <p className="text-xs text-gray-400">{t("parkingIntro")}</p>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)] transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : latest ? (
          <RefreshCw className="h-4 w-4" aria-hidden />
        ) : (
          <Save className="h-4 w-4" aria-hidden />
        )}
        {latest ? t("updateCarLocation") : t("saveCarLocation")}
      </button>

      {geoError && (
        <PermissionNotice
          description={t(ERROR_KEY[geoError])}
          tone={geoError === "permission-denied" ? "error" : "warning"}
        />
      )}

      {saveFailed && !geoError && (
        <PermissionNotice description={t("locationSaveFailed")} tone="error" />
      )}

      {!latest && !geoError && !saveFailed && (
        <PermissionNotice description={t("noParkingSaved")} tone="info" />
      )}

      {latest && (
        <article className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between text-xs text-emerald-300/80">
            <span>{t("savedAtLabel")}</span>
            <span>{formatter.format(new Date(latest.timestamp))}</span>
          </div>
          <div className="text-sm font-semibold text-gray-100">
            {latest.lat.toFixed(5)}, {latest.lng.toFixed(5)}
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={createMapsLink(latest)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-200 transition-colors hover:border-blue-500 hover:text-blue-300 active:scale-95"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              {t("openInMaps")}
            </a>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-200 transition-colors hover:border-blue-500 hover:text-blue-300 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
                  {t("copied")}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                  {t("copyCoords")}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="ml-auto inline-flex items-center gap-1 rounded-xl border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-rose-500 hover:text-rose-300 active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              {t("deleteSavedLocation")}
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
