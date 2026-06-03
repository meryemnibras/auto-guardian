import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SyncStatusIndicator } from "@/components/sync/SyncStatusIndicator";
import { ServiceWorkerRegistrar } from "@/components/sync/ServiceWorkerRegistrar";

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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 antialiased">
        <LanguageProvider>
          <AuthProvider>
            <ServiceWorkerRegistrar />
            <SyncStatusIndicator />
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
