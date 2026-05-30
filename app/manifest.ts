import type { MetadataRoute } from "next";

/**
 * Web App Manifest — makes AI DriveX installable on Android / desktop Chrome.
 * Next.js generates `/manifest.webmanifest` automatically from this export.
 *
 * iOS Safari does not read the manifest's icons array reliably — it uses
 * `<link rel="apple-touch-icon">` declared in app/layout.tsx instead.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI DriveX — مساعد سيارتك الذكي",
    short_name: "AI DriveX",
    description:
      "مساعد السائق الذكي: فحص صوتي، محفظة مصاريف، طوارئ، وأكواد أعطال — يعمل بدون إنترنت.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#020617",
    theme_color: "#020617",
    lang: "ar",
    dir: "auto",
    categories: ["productivity", "utilities", "travel"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "الفحص",
        short_name: "Diagnostics",
        url: "/diagnostics",
        description: "فحص ميكانيكي ومستشار أكواد الأعطال",
      },
      {
        name: "المحفظة",
        short_name: "Wallet",
        url: "/wallet",
        description: "تتبع مصاريف السيارة",
      },
      {
        name: "الطوارئ",
        short_name: "Emergency",
        url: "/emergency",
        description: "موقع السيارة + SOS",
      },
    ],
  };
}
