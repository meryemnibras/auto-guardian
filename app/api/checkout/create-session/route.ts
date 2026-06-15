/**
 * POST /api/checkout/create-session
 *
 * Validates buyer info, writes a `pending` subscription to Supabase, then
 * creates a Stripe Checkout Session and returns its URL. The browser
 * redirects the user to that URL — Stripe hosts the secure card form and
 * handles 3-D Secure, mada, Apple Pay, etc.
 *
 * After payment, Stripe redirects back to /checkout/success and POSTs to
 * /api/webhooks/stripe, which flips the subscription to `active` and sends
 * receipts + founder notifications.
 *
 * Request body:
 *   {
 *     fullName: string,
 *     email: string,
 *     country?: string,
 *     currency: "SAR" | "USD" | "EUR",
 *     language?: "ar" | "en"
 *   }
 */

import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { PRO_PRICE, VAT_RATE, type Currency } from "@/lib/currency";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Body {
  fullName?: unknown;
  email?: unknown;
  country?: unknown;
  currency?: unknown;
  language?: unknown;
}

function isCurrency(v: unknown): v is Currency {
  return v === "SAR" || v === "USD" || v === "EUR";
}

function originFromRequest(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    `https://${request.headers.get("host") ?? "auto-guardian-kappa.vercel.app"}`
  );
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid json" },
      { status: 400 }
    );
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const country = typeof body.country === "string" ? body.country.trim() : "";
  const currency = isCurrency(body.currency) ? body.currency : "SAR";
  const language = body.language === "ar" ? "ar" : "en";

  if (fullName.length < 2) {
    return NextResponse.json({ ok: false, error: "invalid name" }, { status: 400 });
  }
  if (!/^.+@.+\..+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  }

  if (!isStripeConfigured) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local and Vercel env, then redeploy.",
      },
      { status: 503 }
    );
  }
  const stripe = getStripe()!;

  // 1) Create pending subscription row first so we always have a DB anchor
  const admin = getSupabaseAdmin();
  const amount = PRO_PRICE[currency];
  const vatAmount = Math.round(amount * VAT_RATE[currency] * 100) / 100;
  const totalAmount = amount + vatAmount;

  let subscriptionId: string | null = null;
  if (admin) {
    const { data, error } = await admin
      .from("subscriptions")
      .insert({
        email,
        full_name: fullName,
        plan: "pro",
        currency,
        amount,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        status: "pending",
        country: country || null,
        payment_provider: "stripe",
        metadata: { language },
      })
      .select("id")
      .single();
    if (!error && data) subscriptionId = data.id as string;
  }

  // 2) Build Stripe Checkout Session
  const origin = originFromRequest(request);
  const isArabic = language === "ar";

  try {
    // Stripe expects amounts in the smallest currency unit. SAR/USD/EUR
    // are all 2-decimal, so multiply by 100. We send a single line item
    // that already includes VAT so Stripe doesn't try to compute tax.
    const unitAmount = Math.round(totalAmount * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      // Stripe Checkout auto-shows mada / Apple Pay / Google Pay in Saudi
      // sessions when the merchant account has them enabled — we don't need
      // to list them explicitly here.
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: isArabic ? "AI Pro — اشتراك شهري" : "AI Pro — Monthly subscription",
              description: isArabic
                ? "كل قوة الذكاء الاصطناعي لسيارتك — أرخص من زيارة ورشة واحدة."
                : "All of AI DriveX, billed monthly — cheaper than one workshop visit.",
            },
            recurring: { interval: "month" },
            unit_amount: unitAmount,
          },
        },
      ],
      allow_promotion_codes: true,
      // Let Stripe pick the locale from the buyer's browser — both "ar" and
      // "en" are supported on Checkout.
      locale: "auto",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
      metadata: {
        subscription_id: subscriptionId ?? "",
        language,
        currency,
        full_name: fullName,
        country,
      },
      subscription_data: {
        metadata: {
          subscription_id: subscriptionId ?? "",
          language,
        },
      },
    });

    // 3) Persist Stripe session id on the pending row
    if (admin && subscriptionId) {
      await admin
        .from("subscriptions")
        .update({
          payment_intent_id: session.id,
          metadata: { language, stripe_session_id: session.id },
        })
        .eq("id", subscriptionId);
    }

    return NextResponse.json({
      ok: true,
      url: session.url,
      sessionId: session.id,
      subscriptionId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[/api/checkout/create-session] Stripe error:", msg);
    return NextResponse.json(
      { ok: false, error: `Stripe error: ${msg}` },
      { status: 502 }
    );
  }
}
