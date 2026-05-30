export type RecordingStatus =
  | "idle"
  | "requesting-permission"
  | "recording"
  | "analyzing"
  | "completed"
  | "error";

export type AcousticDiagnosisSeverity = "normal" | "warning" | "critical";

export interface AcousticDiagnosisResult {
  title: string;
  description: string;
  severity: AcousticDiagnosisSeverity;
  recommendation: string;
}

export type FaultUrgency = "low" | "medium" | "high";

export interface FaultCodeExplanation {
  code: string;
  title: string;
  humanExplanation: string;
  recommendedAction: string;
  urgency: FaultUrgency;
}
