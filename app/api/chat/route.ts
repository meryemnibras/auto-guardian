import { anthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, type LanguageModel, type ModelMessage } from "ai";
import { PROMPTS } from "@/src/lib/ai/prompts";
import {
  isAnthropicConfigured,
  isGeminiConfigured,
  isGroqConfigured,
  getGroqModel,
  ANTHROPIC_DEFAULT_MODEL,
  GEMINI_DEFAULT_MODEL,
} from "@/src/lib/ai/providers";
import { rateLimit, clientIp } from "@/src/lib/rateLimit";

// Abuse guard: cap chat requests per client so a single visitor can't drain
// the shared free AI quota during a public demo. Tune via env if needed.
const CHAT_RATE_LIMIT = Number(process.env.CHAT_RATE_LIMIT ?? 15);
const CHAT_RATE_WINDOW_MS = Number(process.env.CHAT_RATE_WINDOW_MS ?? 60_000);

export const maxDuration = 30;

interface ChatRequest {
  messages: ModelMessage[];
}

const SYSTEM_PROMPT = PROMPTS.driverAssistant;

// Shown only when the configured provider fails at runtime (e.g. revoked /
// region-blocked key, network error) so the assistant never returns an empty
// reply. As soon as a valid key is in place, real AI tokens stream instead.
const FALLBACK_REPLY =
  "عذرًا، تعذّر الاتصال بالمساعد الذكي حاليًا. يرجى المحاولة بعد قليل.\n" +
  "(The AI assistant is temporarily unavailable — please try again shortly.)";

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

function pickPrimaryModel(): {
  model: LanguageModel;
  provider: "anthropic" | "groq" | "gemini";
} | null {
  // Prefer Anthropic when configured; then free Groq; then free Gemini.
  if (isAnthropicConfigured) {
    return {
      model: anthropic(process.env.ANTHROPIC_MODEL ?? ANTHROPIC_DEFAULT_MODEL),
      provider: "anthropic",
    };
  }
  if (isGroqConfigured) {
    const model = getGroqModel();
    if (model) {
      return { model, provider: "groq" };
    }
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
  // Rate-limit before doing any work so abusive traffic is cheap to reject.
  const rl = rateLimit(
    clientIp(req),
    "chat",
    CHAT_RATE_LIMIT,
    CHAT_RATE_WINDOW_MS
  );
  if (!rl.ok) {
    return Response.json(
      {
        error:
          "عدد كبير من الطلبات في وقت قصير. يرجى الانتظار قليلاً ثم المحاولة مجددًا.\n(Too many requests — please slow down and try again shortly.)",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.retryAfter),
          "X-RateLimit-Limit": String(rl.limit),
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      }
    );
  }

  const picked = pickPrimaryModel();
  if (!picked) {
    return Response.json(
      {
        error:
          "No AI provider configured. Set GROQ_API_KEY (free, no card, at console.groq.com/keys), ANTHROPIC_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY in .env.local.",
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

  const encoder = new TextEncoder();
  let usedFallback = false;

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

    // Wrap the provider's token stream so any runtime failure (revoked /
    // region-blocked key, network drop) degrades to a clear fallback message
    // instead of an empty 200 body.
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let produced = false;
        try {
          for await (const chunk of result.textStream) {
            produced = true;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          console.error(
            `[chat] stream aborted (${picked.provider}):`,
            friendlyErrorMessage(err)
          );
        }
        // Covers both a thrown error AND a silent empty completion (the AI SDK
        // swallows the throw when onError is set, ending the stream with no
        // tokens — e.g. a revoked / region-blocked key).
        if (!produced) {
          usedFallback = true;
          controller.enqueue(encoder.encode(FALLBACK_REPLY));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Accel-Buffering": "no",
        // Reflects the provider that was attempted; the client can detect a
        // degraded reply via the X-Chat-Fallback header below.
        "X-Chat-Provider": picked.provider,
      },
    });
  } catch (e) {
    // Synchronous failure before streaming started — still return a usable body.
    const message = friendlyErrorMessage(e);
    console.error(`[chat] sync error (${picked.provider}):`, message);
    usedFallback = true;
    return new Response(FALLBACK_REPLY, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Chat-Provider": picked.provider,
        "X-Chat-Fallback": String(usedFallback),
      },
    });
  }
}
