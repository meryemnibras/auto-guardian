"use client";

import { Download, Apple, Smartphone } from "lucide-react";
import { MotionSection } from "./MotionSection";
import { getLandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";

export function DownloadSection() {
  const { language } = useTranslation();
  const dict = getLandingDict(language);
  const isArabic = language === "ar";

  return (
    <MotionSection className="relative py-20 sm:py-24" id="download">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-blue-950/80 via-slate-900 to-violet-950/80 p-8 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
            <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-violet-500/30 blur-[120px]" />
          </div>

          {/* Large white logo watermark behind the store buttons — brand identity */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 z-0 hidden w-1/2 items-center justify-center lg:flex ${
              isArabic ? "left-0" : "right-0"
            }`}
          >
            {/* Soft halo orb behind the logo for premium feel */}
            <div className="absolute h-[420px] w-[420px] rounded-full bg-gradient-to-br from-cyan-500/15 via-blue-600/12 to-violet-600/15 blur-[80px]" />
            <img
              src="/white.png"
              alt=""
              className="relative h-[520px] w-[520px] object-contain opacity-[0.18] [filter:drop-shadow(0_0_55px_rgba(34,211,238,0.55))] [mask-image:radial-gradient(circle,black_50%,transparent_82%)]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className={`text-center ${isArabic ? "lg:text-right" : "lg:text-left"}`}>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
                <Smartphone className="h-3.5 w-3.5" />
                {dict.downloadBadge}
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {dict.downloadTitle}{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  {dict.downloadTitleAccent}
                </span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                {dict.downloadSubtitle}
              </p>
            </div>

            <div className={`flex flex-col items-center gap-4 sm:flex-row sm:justify-center ${
              isArabic ? "lg:justify-end" : "lg:justify-start"
            }`}>
              <a
                href="#"
                className={`group flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl border border-white/15 bg-slate-950/70 px-5 py-4 text-white backdrop-blur transition-all hover:scale-[1.02] hover:border-cyan-400/40 hover:bg-slate-950/90 sm:w-auto ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                <Download className="h-7 w-7 text-cyan-300" />
                <span className="flex flex-col leading-tight">
                  <span className="text-[11px] text-slate-400">{dict.storeDownloadFrom}</span>
                  <span className="text-base font-bold">{dict.storeGoogle}</span>
                </span>
              </a>
              <a
                href="#"
                className={`group flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl border border-white/15 bg-slate-950/70 px-5 py-4 text-white backdrop-blur transition-all hover:scale-[1.02] hover:border-violet-400/40 hover:bg-slate-950/90 sm:w-auto ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                <Apple className="h-7 w-7 text-violet-300" />
                <span className="flex flex-col leading-tight">
                  <span className="text-[11px] text-slate-400">{dict.storeDownloadFrom}</span>
                  <span className="text-base font-bold">{dict.storeApple}</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
