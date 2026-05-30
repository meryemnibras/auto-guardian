import { z } from "zod";
import {
  getAnthropic,
  generateWithGemini,
  isAnthropicConfigured,
  isGeminiConfigured,
  ANTHROPIC_DEFAULT_MODEL,
} from "@/src/lib/ai/providers";
import { PROMPTS } from "@/src/lib/ai/prompts";
import { getRandomAcousticResult } from "@/lib/acousticResults";
import type {
  AcousticDiagnosisResult,
  AcousticDiagnosisSeverity,
} from "@/types/mechanical";

export const maxDuration = 30;

const RequestSchema = z.object({
  description: z.string().min(8).max(2000),
});

type Source = "ai-anthropic" | "ai-gemini" | "mock";

interface AnalyzeResponse {
  source: Source;
  result: AcousticDiagnosisResult;
  hint?: string;
}

const VALID_SEVERITIES: readonly AcousticDiagnosisSeverity[] = [
  "normal",
  "warning",
  "critical",
];

function isSeverity(value: unknown): value is AcousticDiagnosisSeverity {
  return (
    typeof value === "string" &&
    (VALID_SEVERITIES as readonly string[]).includes(value)
  );
}

const JSON_INSTRUCTION = (description: string) =>
  `وصف الصوت: ${description}

أعد إجابتك كـ JSON صالح فقط بهذا الشكل بدون أي نص قبله أو بعده:
{
  "title": "أرجح فرضية في 4-6 كلمات",
  "description": "شرح موجز في جملتين",
  "severity": "normal" | "warning" | "critical",
  "recommendation": "إجراء عملي في جملة"
}`;

function parseModelJson(text: string): AcousticDiagnosisResult | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Record<string, unknown>;
    return {
      title: typeof parsed.title === "string" ? parsed.title : "تحليل صوتي",
      description:
        typeof parsed.description === "string"
          ? parsed.description
          : "تعذّر الحصول على شرح واضح.",
      severity: isSeverity(parsed.severity) ? parsed.severity : "warning",
      recommendation:
        typeof parsed.recommendation === "string"
          ? parsed.recommendation
          : "زر فني صيانة متخصص.",
    };
  } catch {
    return null;
  }
}

async function analyzeViaAnthropic(
  description: string
): Promise<AcousticDiagnosisResult | null> {
  const client = getAnthropic();
  if (!client) return null;
  try {
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? ANTHROPIC_DEFAULT_MODEL,
      max_tokens: 512,
      system: PROMPTS.acousticAnalyst,
      messages: [{ role: "user", content: JSON_INSTRUCTION(description) }],
    });
    const textPart = message.content.find((p) => p.type === "text");
    if (!textPart || textPart.type !== "text") return null;
    return parseModelJson(textPart.text);
  } catch {
    return null;
  }
}

async function analyzeViaGemini(
  description: string
): Promise<AcousticDiagnosisResult | null> {
  const text = await generateWithGemini({
    system: PROMPTS.acousticAnalyst,
    prompt: JSON_INSTRUCTION(description),
    maxTokens: 512,
  });
  if (!text) return null;
  return parseModelJson(text);
}

function mockFallback(hint: string): AnalyzeResponse {
  return { source: "mock", result: getRandomAcousticResult(), hint };
}

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request shape", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const desc = parsed.data.description;

  if (isAnthropicConfigured) {
    const r = await analyzeViaAnthropic(desc);
    if (r) return Response.json({ source: "ai-anthropic", result: r });
  }
  if (isGeminiConfigured) {
    const r = await analyzeViaGemini(desc);
    if (r) return Response.json({ source: "ai-gemini", result: r });
  }

  const hint = isAnthropicConfigured || isGeminiConfigured
    ? "All AI providers failed — check server logs"
    : "No AI provider configured";
  return Response.json(mockFallback(hint));
}
