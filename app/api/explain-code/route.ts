import { z } from "zod";
import {
  getAnthropic,
  generateWithGemini,
  generateWithGroq,
  isAnthropicConfigured,
  isGeminiConfigured,
  isGroqConfigured,
  ANTHROPIC_DEFAULT_MODEL,
} from "@/src/lib/ai/providers";
import { PROMPTS } from "@/src/lib/ai/prompts";
import { getFaultCodeExplanation } from "@/lib/faultCodes";
import type { FaultCodeExplanation, FaultUrgency } from "@/types/mechanical";

/**
 * Explain an OBD-II code. Strategy:
 *  1. Local dictionary (instant, free).
 *  2. Anthropic if configured & call succeeds.
 *  3. Gemini if configured & call succeeds.       ← free path
 *  4. Structured mock otherwise — never crashes the UI.
 */

export const maxDuration = 30;

const RequestSchema = z.object({
  code: z.string().min(1).max(16),
});

type ExplanationSource =
  | "local"
  | "ai-anthropic"
  | "ai-groq"
  | "ai-gemini"
  | "mock";

interface ExplanationResponse {
  source: ExplanationSource;
  explanation: FaultCodeExplanation;
  hint?: string;
}

const VALID_URGENCIES: readonly FaultUrgency[] = ["low", "medium", "high"];

function isUrgency(value: unknown): value is FaultUrgency {
  return typeof value === "string" && (VALID_URGENCIES as readonly string[]).includes(value);
}

const JSON_INSTRUCTION = (code: string) =>
  `اشرح كود الخطأ ${code} وأعد الإجابة كـ JSON صالح فقط بهذا الشكل بدون أي نص حوله:
{
  "title": "عنوان موجز للعطل",
  "humanExplanation": "شرح مبسّط للسائق في جملتين",
  "recommendedAction": "الإجراء المقترح في جملة",
  "urgency": "low" | "medium" | "high"
}
إذا كنت لا تعرف الكود، أرجع urgency=medium مع شرح يطلب التحقق من مصدر متخصص.`;

function parseModelJson(text: string, code: string): FaultCodeExplanation | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Record<string, unknown>;
    return {
      code,
      title: typeof parsed.title === "string" ? parsed.title : `الكود ${code}`,
      humanExplanation:
        typeof parsed.humanExplanation === "string"
          ? parsed.humanExplanation
          : "لم يتمكن المساعد من تقديم شرح واضح.",
      recommendedAction:
        typeof parsed.recommendedAction === "string"
          ? parsed.recommendedAction
          : "راجع فني صيانة متخصص.",
      urgency: isUrgency(parsed.urgency) ? parsed.urgency : "medium",
    };
  } catch {
    return null;
  }
}

async function explainViaAnthropic(code: string): Promise<FaultCodeExplanation | null> {
  const client = getAnthropic();
  if (!client) return null;
  try {
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? ANTHROPIC_DEFAULT_MODEL,
      max_tokens: 512,
      system: PROMPTS.faultCodeExplainer,
      messages: [{ role: "user", content: JSON_INSTRUCTION(code) }],
    });
    const textPart = message.content.find((p) => p.type === "text");
    if (!textPart || textPart.type !== "text") return null;
    return parseModelJson(textPart.text, code);
  } catch {
    return null;
  }
}

async function explainViaGroq(code: string): Promise<FaultCodeExplanation | null> {
  const text = await generateWithGroq({
    system: PROMPTS.faultCodeExplainer,
    prompt: JSON_INSTRUCTION(code),
    maxTokens: 512,
  });
  if (!text) return null;
  return parseModelJson(text, code);
}

async function explainViaGemini(code: string): Promise<FaultCodeExplanation | null> {
  const text = await generateWithGemini({
    system: PROMPTS.faultCodeExplainer,
    prompt: JSON_INSTRUCTION(code),
    maxTokens: 512,
  });
  if (!text) return null;
  return parseModelJson(text, code);
}

function mockExplanation(code: string, hint: string): ExplanationResponse {
  return {
    source: "mock",
    explanation: {
      code,
      title: `الكود ${code} (وضع تجريبي)`,
      humanExplanation:
        "هذا الكود ليس في قاعدة البيانات المحلية، ولم يستجب أي مزوّد AI. لتفعيل الشرح الذكي مجاناً، أضف GOOGLE_GENERATIVE_AI_API_KEY في .env.local (مفتاح مجاني من aistudio.google.com).",
      recommendedAction:
        "افحص الكود يدوياً عبر مصادر موثوقة (دليل السيارة، قاعدة بيانات OBD-II)، أو زر فني صيانة معتمد.",
      urgency: "medium",
    },
    hint,
  };
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

  const code = parsed.data.code.trim().toUpperCase();

  // 1) Local dictionary first — free & instant.
  const local = getFaultCodeExplanation(code);
  if (local) {
    return Response.json({ source: "local", explanation: local } satisfies ExplanationResponse);
  }

  // 2) Anthropic if configured.
  if (isAnthropicConfigured) {
    const r = await explainViaAnthropic(code);
    if (r) {
      return Response.json({
        source: "ai-anthropic",
        explanation: r,
      } satisfies ExplanationResponse);
    }
  }

  // 3) Groq if configured (free tier path).
  if (isGroqConfigured) {
    const r = await explainViaGroq(code);
    if (r) {
      return Response.json({
        source: "ai-groq",
        explanation: r,
      } satisfies ExplanationResponse);
    }
  }

  // 4) Gemini if configured (free tier path).
  if (isGeminiConfigured) {
    const r = await explainViaGemini(code);
    if (r) {
      return Response.json({
        source: "ai-gemini",
        explanation: r,
      } satisfies ExplanationResponse);
    }
  }

  // 5) Mock fallback with diagnostic hint.
  const hint = isAnthropicConfigured || isGroqConfigured || isGeminiConfigured
    ? "All AI providers failed — check server logs"
    : "No AI provider configured";
  return Response.json(mockExplanation(code, hint));
}
