"use client";

import { useState } from "react";
import { Heart, Download, Apple } from "lucide-react";
import { getLandingDict, type LandingDict } from "@/lib/landingI18n";
import { useTranslation } from "@/components/LanguageProvider";

interface FooterLink {
  href: string;
  labelKey: keyof LandingDict;
}

const FOOTER_LINKS: FooterLink[] = [
  { href: "#features", labelKey: "footerFeatures" },
  { href: "#pricing", labelKey: "footerPricing" },
  { href: "#download", labelKey: "footerDownload" },
  { href: "#contact", labelKey: "footerContact" },
  { href: "#founder", labelKey: "footerFounder" },
];

export function Footer() {
  const [logoOk, setLogoOk] = useState(true);
  const { language } = useTranslation();
  const dict = getLandingDict(language);
  const isArabic = language === "ar";

  return (
    <footer className="relative">
      {/* Top accent line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"
      />

      {/* Frosted-glass panel */}
      <div
        className="relative overflow-hidden bg-white/[0.04] backdrop-blur-2xl backdrop-saturate-150"
        style={{ WebkitBackdropFilter: "blur(28px) saturate(150%)" }}
      >
        {/* Inner top edge highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.04] to-transparent"
        />

        {/* Soft glow orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-10 h-72 w-72 rounded-full bg-violet-500/15 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-10 h-72 w-72 rounded-full bg-cyan-500/12 blur-[120px]"
        />

        {/* === Faint white watermark on the download-buttons side === */}
        <div
          aria-hidden
          className={`pointer-events-none absolute top-1/2 z-0 hidden -translate-y-1/2 md:block ${
            isArabic ? "left-8" : "right-8"
          }`}
        >
          <img
            src="/white.png"
            alt=""
            className="h-[380px] w-[380px] object-contain opacity-[0.045] [filter:drop-shadow(0_0_50px_rgba(255,255,255,0.08))] [mask-image:radial-gradient(circle,black_42%,transparent_82%)]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {/* 3-column grid */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-10">
            {/* === Brand block — stacked: logo → name → tagline === */}
            <div
              className={`md:col-span-5 ${
                isArabic ? "text-center md:text-right" : "text-center md:text-left"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                {isArabic ? "عن AI DriveX" : "About AI DriveX"}
              </p>

              <div
                className={`mt-5 flex flex-col gap-3 ${
                  "items-center md:items-start"
                }`}
              >
                {/* Logo with strong illumination halo */}
                <div className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.4)_0%,rgba(59,130,246,0.25)_45%,transparent_72%)] blur-2xl"
                  />
                  {logoOk ? (
                    <img
                      src="/logo.png"
                      alt="AI DriveX"
                      className="relative h-16 w-16 object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.85)] sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                      onError={() => setLogoOk(false)}
                    />
                  ) : (
                    <span className="text-2xl font-extrabold tracking-tighter text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.85)] sm:text-3xl">
                      AX
                    </span>
                  )}
                </div>

                {/* Brand name */}
                <span className="text-xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-2xl lg:text-3xl">
                  AI{" "}
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                    DriveX
                  </span>
                </span>

                {/* Tagline */}
                <p className="max-w-sm text-sm leading-relaxed text-white/70">
                  {dict.footerTagline}
                </p>
              </div>
            </div>

            {/* === Quick links (col 2 = middle in both languages) === */}
            <div
              className={`md:col-span-3 ${
                isArabic ? "text-center md:text-right" : "text-center md:text-left"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                {isArabic ? "روابط سريعة" : "Quick links"}
              </p>
              <nav
                className={`mt-5 flex flex-col gap-2.5 ${
                  "items-center md:items-start"
                }`}
              >
                {FOOTER_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-white/75 transition-colors hover:text-cyan-300"
                  >
                    {dict[link.labelKey]}
                  </a>
                ))}
              </nav>
            </div>

            {/* === Download block (col 3 = far-left in RTL / far-right in LTR) === */}
            <div
              className={`md:col-span-4 ${
                isArabic ? "text-center md:text-right" : "text-center md:text-left"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                {isArabic ? "حمّل التطبيق" : "Get the app"}
              </p>
              <div
                className={`mt-5 flex flex-col gap-3 ${
                  "items-center md:items-start"
                }`}
              >
                <a
                  href="#"
                  className={`group inline-flex w-full max-w-[220px] items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white backdrop-blur transition-all hover:scale-[1.02] hover:border-cyan-400/40 hover:bg-slate-950/85 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  <Download className="h-7 w-7 flex-shrink-0 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]" />
                  <span className="flex flex-col leading-tight">
                    <span className="text-[10px] text-slate-400">{dict.storeDownloadFrom}</span>
                    <span className="text-sm font-bold">{dict.storeGoogle}</span>
                  </span>
                </a>
                <a
                  href="#"
                  className={`group inline-flex w-full max-w-[220px] items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white backdrop-blur transition-all hover:scale-[1.02] hover:border-violet-400/40 hover:bg-slate-950/85 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  <Apple className="h-7 w-7 flex-shrink-0 text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.55)]" />
                  <span className="flex flex-col leading-tight">
                    <span className="text-[10px] text-slate-400">{dict.storeDownloadFrom}</span>
                    <span className="text-sm font-bold">{dict.storeApple}</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="mt-12 border-t border-white/10 pt-6">
            <div className="flex flex-col items-center justify-between gap-3 text-xs sm:flex-row">
              <p className="text-white/60">{dict.footerRights}</p>

              <a
                href="https://www.linkedin.com/in/meryem-boulbassir-1806891a9/"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-white/80 backdrop-blur transition-all hover:border-cyan-400/40 hover:bg-white/10 hover:text-white"
              >
                <Heart className="h-3 w-3 fill-rose-400 text-rose-400" aria-hidden />
                <span>
                  {isArabic ? "تصميم وتطوير: " : "Designed & developed by "}
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text font-semibold text-transparent">
                    Meryem Boulbassir
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
