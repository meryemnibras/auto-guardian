import type { MaintenanceType } from "@/types/db";
import type { MaintenanceAccent } from "@/types/wallet";

export interface MaintenanceConfig {
  id: MaintenanceType;
  titleKey: "oilChange" | "airFilter" | "tireInspection";
  intervalKm: number;
  lastServiceKm: number;
  accent: MaintenanceAccent;
}

export const DEFAULT_CURRENT_KM = 38_800;

export const DEFAULT_MAINTENANCE: readonly MaintenanceConfig[] = [
  {
    id: "oil",
    titleKey: "oilChange",
    intervalKm: 5_000,
    lastServiceKm: 35_000,
    accent: "blue",
  },
  {
    id: "air",
    titleKey: "airFilter",
    intervalKm: 10_000,
    lastServiceKm: 28_000,
    accent: "violet",
  },
  {
    id: "tires",
    titleKey: "tireInspection",
    intervalKm: 8_000,
    lastServiceKm: 30_000,
    accent: "cyan",
  },
];

export function calculateMaintenanceProgress(
  currentKm: number,
  lastServiceKm: number,
  intervalKm: number
): { remainingKm: number; progress: number } {
  if (!Number.isFinite(currentKm) || !Number.isFinite(lastServiceKm) || intervalKm <= 0) {
    return { remainingKm: 0, progress: 100 };
  }

  const target = lastServiceKm + intervalKm;
  const remainingKm = Math.max(0, target - currentKm);

  const consumed = currentKm - lastServiceKm;
  const raw = (consumed / intervalKm) * 100;
  const progress = Math.min(100, Math.max(0, raw));

  return { remainingKm, progress };
}
