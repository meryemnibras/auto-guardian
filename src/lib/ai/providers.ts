/**
 * AI provider initialization — server-only.
 *
 * Clients are constructed lazily and only when the matching env var is set.
 * No paid API call is made at import time; this module is safe to load even
 * with empty credentials.
 *
 * Import these helpers from API route handlers (server) only. Never from
 * client components — keys must stay on the server.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, type LanguageModel } from "ai";

export const ANTHROPIC_DEFAULT_MODEL = "claude-sonnet-4-6";
export const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";
// gemini-2.5-flash is in the free tier for new accounts (2026);
// 2.0-flash moved to paid-only. Override via GEMINI_MODEL if needed.
export const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash";

export const isAnthropicConfigured: boolean = Boolean(
  process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 0
);

export const isOpenAIConfigured: boolean = Boolean(
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0
);

export const isGeminiConfigured: boolean = Boolean(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY &&
    process.env.GOOGLE_GENERATIVE_AI_API_KEY.length > 0
);

let _anthropic: Anthropic | null = null;
let _openai: OpenAI | null = null;
let _geminiModel: LanguageModel | null = null;

export function getAnthropic(): Anthropic | null {
  if (!isAnthropicConfigured) return null;
  if (_anthropic) return _anthropic;
  _anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  return _anthropic;
}

export function getOpenAI(): OpenAI | null {
  if (!isOpenAIConfigured) return null;
  if (_openai) return _openai;
  _openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return _openai;
}

export function getGeminiModel(): LanguageModel | null {
  if (!isGeminiConfigured) return null;
  if (_geminiModel) return _geminiModel;
  const provider = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  _geminiModel = provider(
    process.env.GEMINI_MODEL ?? GEMINI_DEFAULT_MODEL
  );
  return _geminiModel;
}

/**
 * Run a single prompt through Gemini and return the text response.
 * Returns null on any failure so callers can fall back gracefully.
 */
export async function generateWithGemini(args: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string | null> {
  const model = getGeminiModel();
  if (!model) return null;
  try {
    const result = await generateText({
      model,
      system: args.system,
      prompt: args.prompt,
      maxOutputTokens: args.maxTokens ?? 512,
    });
    return result.text.trim();
  } catch (e) {
    // Temporary diagnostic — prints the real Google error to the dev console.
    console.error("[gemini]", e instanceof Error ? e.message : String(e));
    return null;
  }
}

export type ProviderName = "anthropic" | "openai" | "gemini" | "mock";

export interface ProviderAvailability {
  anthropic: boolean;
  openai: boolean;
  gemini: boolean;
}

export function listAvailableProviders(): ProviderAvailability {
  return {
    anthropic: isAnthropicConfigured,
    openai: isOpenAIConfigured,
    gemini: isGeminiConfigured,
  };
}

export const hasAnyAIProvider: boolean =
  isAnthropicConfigured || isOpenAIConfigured || isGeminiConfigured;
