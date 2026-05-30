import type { Coordinates } from "@/types/emergency";

const EARTH_RADIUS_M = 6_371_000;

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function calculateDistanceMeters(
  from: Coordinates,
  to: Coordinates
): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return "—";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function createMapsLink(coordinates: Coordinates): string {
  return `https://maps.google.com/?q=${coordinates.lat},${coordinates.lng}`;
}
