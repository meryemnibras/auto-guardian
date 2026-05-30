export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeolocationSnapshot extends Coordinates {
  accuracy: number;
  timestamp: number;
}

export interface SavedParkingLocation extends Coordinates {
  id?: number;
  timestamp: number;
}

export type GeolocationStatus =
  | "idle"
  | "requesting"
  | "watching"
  | "success"
  | "unsupported"
  | "permission-denied"
  | "error";

export type GeolocationErrorCode =
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "unsupported";

export type MotionPermissionStatus =
  | "unknown"
  | "granted"
  | "denied"
  | "unsupported"
  | "requires-permission";

export interface DistanceResult {
  meters: number;
  label: string;
}

export interface SOSMessagePayload {
  coordinates: Coordinates | null;
  message: string;
}

export type PermissionNoticeTone = "info" | "warning" | "error";
