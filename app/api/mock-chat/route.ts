import { z } from "zod";
import { listAvailableProviders } from "@/src/lib/ai/providers";

/**
 * Cost-free mock endpoint that mirrors the shape of a real chat API.
 * No paid call is made — useful while wiring up UI before adding keys.
 */

const RequestSchema = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

const MOCK_REPLY =
  "تم تجهيز نظام AI بنجاح، ضع API key لاحقًا لتفعيل الرد الحقيقي.";

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

  // Tiny delay to feel like a real call without spending tokens.
  await new Promise((r) => setTimeout(r, 350));

  return Response.json({
    reply: MOCK_REPLY,
    echo: parsed.data.message,
    providers: listAvailableProviders(),
    mock: true,
  });
}

export async function GET(): Promise<Response> {
  return Response.json({
    status: "ok",
    mock: true,
    providers: listAvailableProviders(),
    hint: "POST { message: string, history?: [{role, content}] }",
  });
}
