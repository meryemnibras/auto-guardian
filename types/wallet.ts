export type ExpenseCategory =
  | "fuel"
  | "maintenance"
  | "insurance"
  | "parking"
  | "wash"
  | "other";

export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  "fuel",
  "maintenance",
  "insurance",
  "parking",
  "wash",
  "other",
] as const;

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value);
}

export interface ExpenseFormState {
  amount: string;
  category: ExpenseCategory;
  date: string;
}

export interface ReceiptOcrResult {
  amount: number | null;
  rawText: string;
  confidence: number;
}

export type MaintenanceAccent =
  | "blue"
  | "violet"
  | "cyan"
  | "emerald"
  | "amber";

export interface MaintenanceItem {
  id: string;
  title: string;
  currentKm: number;
  targetKm: number;
  intervalKm: number;
  remainingKm: number;
  progress: number;
  accent: MaintenanceAccent;
}
