import { anthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, type LanguageModel, type ModelMessage } from "ai";
import { PROMPTS } from "@/src/lib/ai/prompts";
import {
  isAnthropicConfigured,
  isGeminiConfigured,
  ANTHROPIC_DEFAULT_MODEL,
  GEMINI_DEFAULT_MODEL,
} from "@/src/lib/ai/providers";

export const maxDuration = 30;

interface ChatRequest {
  messages: ModelMessage[];
}

const SYSTEM_PROMPT = PROMPTS.driverAssistant;

interface ApiErrorLike {
  responseBody?: string;
  message?: string;
  statusCode?: number;
}

function friendlyErrorMessage(e: unknown): string {
  const err = e as ApiErrorLike;
  if (typeof err.responseBody === "string" && err.responseBody.length > 0) {
    try {
      const parsed = JSON.parse(err.responseBody) as {
        error?: { message?: string; type?: string };
      };
      if (parsed.error?.message) return parsed.error.message;
    } catch {
      /* fall through */
    }
  }
  if (typeof err.message === "string" && err.message.length > 0) {
    return err.message;
  }
  return String(e);
}

function pickPrimaryModel(): { model: LanguageModel; provider: "anthropic" | "gemini" } | null {
  // Prefer Anthropic when configured; otherwise fall back to free Gemini.
  if (isAnthropicConfigured) {
    return {
      model: anthropic(process.env.ANTHROPIC_MODEL ?? ANTHROPIC_DEFAULT_MODEL),
      provider: "anthropic",
    };
  }
  if (isGeminiConfigured) {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    return {
      model: google(process.env.GEMINI_MODEL ?? GEMINI_DEFAULT_MODEL),
      provider: "gemini",
    };
  }
  return null;
}

export async function POST(req: Request): Promise<Response> {
  const picked = pickPrimaryModel();
  if (!picked) {
    return Response.json(
      {
        error:
          "No AI provider configured. Set ANTHROPIC_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in .env.local (Gemini is free at aistudio.google.com/apikey).",
      },
      { status: 503 }
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json(
      { error: "messages array is required" },
      { status: 400 }
    );
  }

  try {
    const result = streamText({
      model: picked.model,
      system: SYSTEM_PROMPT,
      messages: body.messages,
      onError({ error }) {
        console.error(
          `[chat] streaming error (${picked.provider}):`,
          friendlyErrorMessage(error)
        );
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Accel-Buffering": "no",
        "X-Chat-Provider": picked.provider,
      },
    });
  } catch (e) {
    const message = friendlyErrorMessage(e);
    console.error(`[chat] sync error (${picked.provider}):`, message);
    return Response.json({ error: message, provider: picked.provider }, { status: 500 });
  }
}
