import type { LucideIcon } from "lucide-react";
import {
  Mic,
  ShieldCheck,
  MapPin,
  Camera,
  Receipt,
  Siren,
  Wrench,
  Wallet,
  ParkingCircle,
  Route,
  AudioLines,
  KeyRound,
} from "lucide-react";
import type { LandingDict } from "./landingI18n";

export interface NavLink {
  href: string;
  labelKey: keyof LandingDict;
}

export const NAV_LINKS: NavLink[] = [
  { href: "#features", labelKey: "navFeatures" },
  { href: "#how", labelKey: "navTech" },
  { href: "#pricing", labelKey: "navPricing" },
  { href: "#contact", labelKey: "navContact" },
  { href: "#founder", labelKey: "navFounder" },
];

export interface PainItem {
  problemKey: keyof LandingDict;
  solutionKey: keyof LandingDict;
  icon: LucideIcon;
}

export const PAIN_ITEMS: PainItem[] = [
  { icon: Wrench, problemKey: "pain1Problem", solutionKey: "pain1Solution" },
  { icon: Wallet, problemKey: "pain2Problem", solutionKey: "pain2Solution" },
  { icon: ParkingCircle, problemKey: "pain3Problem", solutionKey: "pain3Solution" },
  { icon: AudioLines, problemKey: "pain4Problem", solutionKey: "pain4Solution" },
  { icon: Receipt, problemKey: "pain5Problem", solutionKey: "pain5Solution" },
  { icon: KeyRound, problemKey: "pain6Problem", solutionKey: "pain6Solution" },
  { icon: Camera, problemKey: "pain7Problem", solutionKey: "pain7Solution" },
  { icon: Route, problemKey: "pain8Problem", solutionKey: "pain8Solution" },
];

export interface FeatureItem {
  titleKey: keyof LandingDict;
  descKey: keyof LandingDict;
  icon: LucideIcon;
  gradient: string;
}

export const FEATURE_ITEMS: FeatureItem[] = [
  {
    icon: Mic,
    titleKey: "feat1Title",
    descKey: "feat1Desc",
    gradient: "from-cyan-400 to-blue-600",
  },
  {
    icon: ShieldCheck,
    titleKey: "feat2Title",
    descKey: "feat2Desc",
    gradient: "from-blue-500 to-violet-600",
  },
  {
    icon: MapPin,
    titleKey: "feat3Title",
    descKey: "feat3Desc",
    gradient: "from-violet-500 to-fuchsia-600",
  },
  {
    icon: Camera,
    titleKey: "feat4Title",
    descKey: "feat4Desc",
    gradient: "from-sky-400 to-indigo-600",
  },
  {
    icon: Receipt,
    titleKey: "feat5Title",
    descKey: "feat5Desc",
    gradient: "from-emerald-400 to-cyan-600",
  },
  {
    icon: Siren,
    titleKey: "feat6Title",
    descKey: "feat6Desc",
    gradient: "from-rose-500 to-violet-600",
  },
];

export interface StepItem {
  number: string;
  titleKey: keyof LandingDict;
  descKey: keyof LandingDict;
}

export const STEP_ITEMS: StepItem[] = [
  { number: "01", titleKey: "step1Title", descKey: "step1Desc" },
  { number: "02", titleKey: "step2Title", descKey: "step2Desc" },
  { number: "03", titleKey: "step3Title", descKey: "step3Desc" },
];

export interface OrbitBadge {
  labelKey: keyof LandingDict;
  icon: LucideIcon;
  /** angle on the orbit ellipse, 0 = top, 90 = right, 180 = bottom, 270 = left */
  angle: number;
  /** floating animation offset in seconds */
  delay: number;
}

/** Badges arranged on an ellipse around the phone mockup */
export const ORBIT_BADGES: OrbitBadge[] = [
  { icon: Mic, labelKey: "floatVoice", angle: -75, delay: 0 },
  { icon: ShieldCheck, labelKey: "floatGuard", angle: -25, delay: 0.4 },
  { icon: Siren, labelKey: "floatSos", angle: 25, delay: 0.8 },
  { icon: Wallet, labelKey: "floatWallet", angle: 75, delay: 1.2 },
  { icon: ParkingCircle, labelKey: "floatGps", angle: -135, delay: 1.6 },
  { icon: Route, labelKey: "floatRoute", angle: 135, delay: 2 },
];
