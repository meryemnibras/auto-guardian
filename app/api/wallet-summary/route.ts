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
import { rateLimit, clientIp } from "@/src/lib/rateLimit";

export const maxDuration = 30;

const ExpenseSchema = z.object({
  amount: z.number().nonnegative(),
  category: z.string().min(1).max(64),
  date: z.string().min(1).max(64),
});

const RequestSchema = z.object({
  expenses: z.array(ExpenseSchema).max(500),
});

type Source = "ai-anthropic" | "ai-groq" | "ai-gemini" | "mock" | "empty";
type Expenses = z.infer<typeof RequestSchema>["expenses"];

interface SummaryResponse {
  source: Source;
  summary: string;
  total: number;
  topCategory: string | null;
  hint?: string;
}

function aggregate(expenses: Expenses) {
  let total = 0;
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    total += e.amount;
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  }
  let topCategory: string | null = null;
  let topAmount = 0;
  for (const [cat, amount] of byCategory) {
    if (amount > topAmount) {
      topCategory = cat;
      topAmount = amount;
    }
  }
  return { total, topCategory, topAmount };
}

async function summarizeViaAnthropic(expenses: Expenses): Promise<string | null> {
  const client = getAnthropic();
  if (!client) return null;
  try {
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? ANTHROPIC_DEFAULT_MODEL,
      max_tokens: 350,
      system: PROMPTS.walletSummarizer,
      messages: [{ role: "user", content: JSON.stringify({ expenses }) }],
    });
    const textPart = message.content.find((p) => p.type === "text");
    if (!textPart || textPart.type !== "text") return null;
    return textPart.text.trim();
  } catch {
    return null;
  }
}

async function summarizeViaGroq(expenses: Expenses): Promise<string | null> {
  return generateWithGroq({
    system: PROMPTS.walletSummarizer,
    prompt: JSON.stringify({ expenses }),
    maxTokens: 350,
  });
}

async function summarizeViaGemini(expenses: Expenses): Promise<string | null> {
  return generateWithGemini({
    system: PROMPTS.walletSummarizer,
    prompt: JSON.stringify({ expenses }),
    maxTokens: 350,
  });
}

function mockSummary(expenses: Expenses, hint: string): SummaryResponse {
  const { total, topCategory, topAmount } = aggregate(expenses);
  const percent = total > 0 ? Math.round((topAmount / total) * 100) : 0;
  return {
    source: "mock",
    summary: `الإجمالي: ${total.toFixed(2)}. أعلى فئة استهلاكاً: ${
      topCategory ?? "غير محدّد"
    } بنسبة ${percent}%. توصية: راقب هذه الفئة الشهر القادم. (وضع تجريبي — أضف مفتاح Gemini مجاناً من aistudio.google.com)`,
    total,
    topCategory,
    hint,
  };
}

export async function POST(req: Request): Promise<Response> {
  const rl = rateLimit(clientIp(req), "wallet-summary", 20, 60_000);
  if (!rl.ok) {
    return Response.json(
      { error: "Too many requests — please slow down." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

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

  const expenses = parsed.data.expenses;

  if (expenses.length === 0) {
    return Response.json({
      source: "empty",
      summary:
        "لا توجد مصاريف لتلخيصها بعد. أضف عمليتك الأولى من نموذج المحفظة.",
      total: 0,
      topCategory: null,
    });
  }

  const { total, topCategory } = aggregate(expenses);

  if (isAnthropicConfigured) {
    const text = await summarizeViaAnthropic(expenses);
    if (text) {
      return Response.json({
        source: "ai-anthropic",
        summary: text,
        total,
        topCategory,
      });
    }
  }
  if (isGroqConfigured) {
    const text = await summarizeViaGroq(expenses);
    if (text) {
      return Response.json({
        source: "ai-groq",
        summary: text,
        total,
        topCategory,
      });
    }
  }
  if (isGeminiConfigured) {
    const text = await summarizeViaGemini(expenses);
    if (text) {
      return Response.json({
        source: "ai-gemini",
        summary: text,
        total,
        topCategory,
      });
    }
  }

  const hint = isAnthropicConfigured || isGroqConfigured || isGeminiConfigured
    ? "All AI providers failed — check server logs"
    : "No AI provider configured";
  return Response.json(mockSummary(expenses, hint));
}
