import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SyncStatusIndicator } from "@/components/sync/SyncStatusIndicator";
import { ServiceWorkerRegistrar } from "@/components/sync/ServiceWorkerRegistrar";

/**
 * Runs before paint to apply the saved theme (default dark) so there's no
 * flash of the wrong background. Mirrors the logic in ThemeProvider.
 */
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('aidrivex-theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`;

export const metadata: Metadata = {
  title: "AI DriveX — مساعد سيارتك الذكي",
  description:
    "AI DriveX هو مساعد السائق الذكي الذي يستمع لمحركك، يتتبع مصاريفك، ويحرس سيارتك حتى بدون إنترنت.",
  applicationName: "AI DriveX",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI DriveX",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon.svg"],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <AuthProvider>
                <ServiceWorkerRegistrar />
                <SyncStatusIndicator />
                {children}
              </AuthProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
