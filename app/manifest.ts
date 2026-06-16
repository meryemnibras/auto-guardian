import type { MetadataRoute } from "next";

/**
 * Web App Manifest — makes AI DriveX installable on Android, desktop Chrome,
 * and packageable by Bubblewrap / PWABuilder for Google Play Store.
 *
 * iOS Safari does not read the manifest's icons array reliably — it uses
 * `<link rel="apple-touch-icon">` declared in app/layout.tsx instead.
 *
 * Some W3C fields (screenshots.form_factor, display_override) aren't in the
 * Next.js type yet but ship to the wire correctly — we extend the return
 * type so TS doesn't reject them.
 */
type ExtendedManifest = MetadataRoute.Manifest & {
  screenshots?: Array<{
    src: string;
    sizes?: string;
    type?: string;
    form_factor?: "narrow" | "wide";
    label?: string;
  }>;
};

export default function manifest(): ExtendedManifest {
  return {
    /** Stable identity — DO NOT change once published to Play Store. */
    id: "/?source=pwa",

    name: "AI DriveX — مساعد سيارتك الذكي",
    short_name: "AI DriveX",
    description:
      "مساعد السائق الذكي: فحص صوتي، محفظة مصاريف، طوارئ، وأكواد أعطال — يعمل بدون إنترنت.",

    /** App opens on the AI Chat home — the actual app experience. */
    start_url: "/?source=pwa",
    scope: "/",

    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait-primary",
    background_color: "#020617",
    theme_color: "#020617",
    lang: "ar",
    dir: "auto",
    categories: ["productivity", "utilities", "travel", "auto"],

    /**
     * Android requires both 192x192 and 512x512 PNG, plus a maskable variant
     * for the adaptive icon system. The SVG fallback handles desktop Chrome.
     */
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    /** App shortcuts shown on long-press of the Android launcher icon. */
    shortcuts: [
      {
        name: "المحادثة الذكية",
        short_name: "Chat",
        url: "/chat",
        description: "اسأل المساعد الذكي عن سيارتك",
      },
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

    /**
     * NOTE: Play Store listing screenshots are uploaded separately in the
     * Play Console — they are NOT taken from the manifest. We intentionally
     * omit `screenshots` here so packagers (PWABuilder / Bubblewrap) don't
     * try to fetch placeholder images that don't exist yet.
     */

    /**
     * `prefer_related_applications: false` tells Play Store this PWA IS the
     * canonical version — important so Chrome's "install app" prompt keeps
     * working after we publish to Play.
     */
    prefer_related_applications: false,
  };
}
