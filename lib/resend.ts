/**
 * Server-only Resend client.
 *
 * Returns `null` when RESEND_API_KEY is missing so API routes can call
 * `sendEmail()` without crashing — they simply skip sending and log.
 */

import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;

export const isResendConfigured: boolean = Boolean(key && key.length > 0);

let cached: Resend | null = null;

export function getResend(): Resend | null {
  if (!isResendConfigured) return null;
  if (cached) return cached;
  cached = new Resend(key!);
  return cached;
}

/** Sender shown to recipients. Default to a generic localhost so dev never breaks. */
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "AI DriveX <onboarding@resend.dev>";

/** Internal notifications inbox (founder). */
export const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || null;

/**
 * Safe wrapper around `resend.emails.send()` that swallows errors so a
 * mail-send failure never breaks a successful checkout / waitlist response.
 */
export async function sendEmail(args: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const client = getResend();
  if (!client) {
    return { ok: false, error: "resend-not-configured" };
  }
  try {
    const res = await client.emails.send({
      from: FROM_EMAIL,
      to: args.to,
      subject: args.subject,
      html: args.html,
      ...(args.replyTo ? { replyTo: args.replyTo } : {}),
    });
    if (res.error) {
      console.warn("[resend] send error:", res.error);
      return { ok: false, error: res.error.message };
    }
    return { ok: true, id: res.data?.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[resend] threw:", msg);
    return { ok: false, error: msg };
  }
}
