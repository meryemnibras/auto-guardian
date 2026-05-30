import { createMapsLink } from "./geo";
import type { Coordinates } from "@/types/emergency";

export interface SOSMessageOptions {
  prefix?: string;
  noLocationNote?: string;
}

const DEFAULT_PREFIX = "AutoGuardian SOS: I need help.";
const DEFAULT_NO_LOCATION = "Location not available.";

export function buildSOSMessage(
  coordinates: Coordinates | null,
  options: SOSMessageOptions = {}
): string {
  const prefix = options.prefix ?? DEFAULT_PREFIX;
  if (coordinates) {
    return `${prefix} ${createMapsLink(coordinates)}`;
  }
  const noLoc = options.noLocationNote ?? DEFAULT_NO_LOCATION;
  return `${prefix} ${noLoc}`;
}

export function buildSMSUrl(message: string, phoneNumber?: string): string {
  const encoded = encodeURIComponent(message);
  const recipient = phoneNumber ?? "";
  return `sms:${recipient}?body=${encoded}`;
}
