"use client";

import { useCallback, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { AcousticScanner } from "@/components/mechanical/AcousticScanner";
import { MaintenanceAdvisor } from "@/components/mechanical/MaintenanceAdvisor";
import { SoundDescriptionAnalyzer } from "@/components/mechanical/SoundDescriptionAnalyzer";
import { DiagnosticsHistory } from "@/components/mechanical/DiagnosticsHistory";

export default function DiagnosticsPage() {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((n) => n + 1);
  }, []);

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-100">
          {t("mechanicalIntelligence")}
        </h1>
        <p className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          {t("mechanicalIntro")}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AcousticScanner onSaved={bumpRefresh} />
        <MaintenanceAdvisor />
      </div>

      <SoundDescriptionAnalyzer onSaved={bumpRefresh} />

      <DiagnosticsHistory refreshKey={refreshKey} />
    </section>
  );
}
