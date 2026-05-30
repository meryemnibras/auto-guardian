"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { useOfflineDB } from "@/hooks/useOfflineDB";
import { ParkingLocationCard } from "./ParkingLocationCard";
import { ReturnCompass } from "./ReturnCompass";
import { SOSPanel } from "./SOSPanel";
import type { SavedParkingLocation } from "@/types/emergency";

export function EmergencyClient() {
  const { t } = useTranslation();
  const { get } = useOfflineDB();
  const [parking, setParking] = useState<SavedParkingLocation | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reloadParking = useCallback(async () => {
    const records = await get("location");
    if (records.length === 0) {
      setParking(null);
      return;
    }
    const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
    const top = sorted[0];
    setParking({
      id: top.id,
      lat: top.lat,
      lng: top.lng,
      timestamp: top.timestamp,
    });
  }, [get]);

  useEffect(() => {
    void reloadParking();
  }, [reloadParking, refreshKey]);

  const handleSaved = useCallback(() => {
    setRefreshKey((n) => n + 1);
  }, []);

  return (
    <section className="flex flex-1 flex-col gap-5">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-100">
          <ShieldAlert className="h-7 w-7 text-rose-300" aria-hidden />
          {t("emergencyTitle")}
        </h1>
        <p className="text-sm text-gray-400">{t("emergencyIntro")}</p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <ParkingLocationCard refreshKey={refreshKey} onSaved={handleSaved} />
          <SOSPanel parking={parking} />
        </div>
        <ReturnCompass parking={parking} />
      </div>
    </section>
  );
}
