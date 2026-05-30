import type { ReceiptOcrResult } from "@/types/wallet";

const SAMPLE_RECEIPTS: readonly string[] = [
  `Fuel Station Plaza
Date: 14/03/2026
Diesel 38L
TOTAL 184.50 SAR
VAT 15%`,
  `محطة الوقود السريع
البنزين 95
الكمية: 42.1 لتر
المجموع: 217.45 ر.س
شكراً لزيارتكم`,
  `QUICK WASH
Premium wash    50.00
Wax service     25.00
Subtotal        75.00
TOTAL           86.25`,
  `Station Total
Diesel B7
Quantite 28 L
TTC: 95.40 EUR
TVA 20%`,
  `Service Center
Oil change       120.00
Air filter        45.00
Labour            60.00
Grand Total: 225.50`,
];

function parseAmount(raw: string): number {
  const normalized = raw.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : Number.NaN;
}

export function extractAmountFromText(text: string): number | null {
  if (!text) return null;
  const keywordMatch = text.match(
    /(?:total|grand\s*total|net|ttc|المجموع|اجمالي|الإجمالي)\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)/i
  );
  if (keywordMatch) {
    const value = parseAmount(keywordMatch[1]);
    if (Number.isFinite(value) && value > 0) return value;
  }

  const numbers = [...text.matchAll(/(\d{1,6}(?:[.,]\d{1,2})?)/g)]
    .map((m) => parseAmount(m[1]))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (numbers.length === 0) return null;
  return Math.max(...numbers);
}

export async function extractReceiptAmount(
  file: File
): Promise<ReceiptOcrResult> {
  if (!file || !file.type.startsWith("image/")) {
    return { amount: null, rawText: "", confidence: 0 };
  }

  // Touch the file so the API mirrors a real reader (no content is uploaded).
  try {
    await file.slice(0, 1).arrayBuffer();
  } catch {
    return { amount: null, rawText: "", confidence: 0 };
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 1200));

  const rawText =
    SAMPLE_RECEIPTS[Math.floor(Math.random() * SAMPLE_RECEIPTS.length)];
  const amount = extractAmountFromText(rawText);
  const confidence =
    amount !== null
      ? Math.round((0.65 + Math.random() * 0.3) * 100) / 100
      : 0;

  return { amount, rawText, confidence };
}
