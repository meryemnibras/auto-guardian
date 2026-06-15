/**
 * POST /api/waitlist/join
 *
 * Captures a pre-launch email. The endpoint is idempotent — if the same
 * email already exists, we return success with `existing: true` rather
 * than an error, so the UI never fails for a re-submit.
 *
 * Request body: { email: string, language?: "ar" | "en", source?: string }
 * Response: 200 { ok: true, existing: boolean }
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail, NOTIFY_EMAIL } from "@/lib/resend";
import { waitlistWelcomeEmail, founderNotifyEmail } from "@/lib/emails";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface JoinBody {
  email?: unknown;
  language?: unknown;
  source?: unknown;
  fullName?: unknown;
  country?: unknown;
}

export async function POST(request: Request) {
  let body: JoinBody;
  try {
    body = (await request.json()) as JoinBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid json" },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^.+@.+\..+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid email" },
      { status: 400 }
    );
  }

  const language =
    body.language === "ar" ? "ar" : body.language === "fr" ? "fr" : "en";
  const source = typeof body.source === "string" ? body.source.slice(0, 80) : "landing";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : null;
  const country = typeof body.country === "string" ? body.country.trim() : null;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Database not configured. Add SUPABASE_SERVICE_ROLE_KEY to env.",
      },
      { status: 503 }
    );
  }

  // Try insert; if it conflicts on unique(email) we still return success.
  const { error } = await admin.from("waitlist").insert({
    email,
    language,
    source,
    full_name: fullName,
    country,
    user_agent: request.headers.get("user-agent") ?? null,
    referrer: request.headers.get("referer") ?? null,
  });

  if (error) {
    const isDuplicate =
      error.code === "23505" ||
      (error.message || "").toLowerCase().includes("duplicate");
    if (isDuplicate) {
      return NextResponse.json({ ok: true, existing: true });
    }
    console.error("[/api/waitlist/join] insert failed:", error.message);
    return NextResponse.json(
      { ok: false, error: "failed to join waitlist" },
      { status: 500 }
    );
  }

  // Fire-and-forget emails — never block the signup response on send latency.
  const emailLang: "ar" | "en" = language === "ar" ? "ar" : "en";
  const welcome = waitlistWelcomeEmail({ email, language: emailLang });
  void sendEmail({ to: email, subject: welcome.subject, html: welcome.html });

  if (NOTIFY_EMAIL) {
    const notif = founderNotifyEmail({
      kind: "waitlist",
      email,
      fullName,
    });
    void sendEmail({
      to: NOTIFY_EMAIL,
      subject: notif.subject,
      html: notif.html,
      replyTo: email,
    });
  }

  return NextResponse.json({ ok: true, existing: false });
}
