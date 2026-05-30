"use client";

import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { PainPointsSection } from "./PainPointsSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { DownloadSection } from "./DownloadSection";
import { PricingSection } from "./PricingSection";
import { ContactSection } from "./ContactSection";
import { FounderSection } from "./FounderSection";
import { Footer } from "./Footer";

export function LandingPage() {
  return (
    <div className="relative min-h-screen scroll-smooth bg-slate-950 text-slate-100 selection:bg-blue-500/40 selection:text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 [background:radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.06),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(139,92,246,0.07),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.06),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_0%,transparent_75%)]"
      />

      <Navbar />

      <main>
        <HeroSection />
        <PainPointsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DownloadSection />
        <PricingSection />
        <ContactSection />
        <FounderSection />
      </main>

      <Footer />
    </div>
  );
}
