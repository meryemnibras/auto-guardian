/**
 * POST /api/checkout/subscribe
 *
 * Validates the checkout form payload and writes a pending subscription
 * row to Supabase. NO PCI data (full card number / CVV) is stored — only
 * the brand and the last 4 digits. The actual charge is the
 * responsibility of the payment provider integration (Stripe / Tap / etc.)
 * which can be wired into this endpoint later.
 *
 * Request body:
 *   {
 *     fullName: string,
 *     email: string,
 *     country: string,
 *     cardNumber: string,     // raw user input — only last 4 + brand are kept
 *     expiry: string,         // MM/YY — only used to validate, not stored
 *     currency: "SAR" | "USD" | "EUR",
 *     language?: "ar" | "en"
 *   }
 *
 * Response:
 *   200 { ok: true, subscriptionId: string, status: "pending" }
 *   400 { ok: false, error: string }
 *   503 { ok: false, error: "database not configured" }
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { PRO_PRICE, VAT_RATE, type Currency } from "@/lib/currency";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SubscribeBody {
  fullName?: unknown;
  email?: unknown;
  country?: unknown;
  cardNumber?: unknown;
  expiry?: unknown;
  currency?: unknown;
  language?: unknown;
}

function detectBrand(num: string): string {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(440647|446404|446672|458456|484783)/.test(n)) return "mada";
  return "unknown";
}

function isCurrency(v: unknown): v is Currency {
  return v === "SAR" || v === "USD" || v === "EUR";
}

export async function POST(request: Request) {
  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid json" },
      { status: 400 }
    );
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const country = typeof body.country === "string" ? body.country.trim() : "";
  const cardNumber =
    typeof body.cardNumber === "string" ? body.cardNumber.replace(/\s/g, "") : "";
  const expiry = typeof body.expiry === "string" ? body.expiry.trim() : "";
  const currency = isCurrency(body.currency) ? body.currency : "SAR";
  const language = body.language === "ar" ? "ar" : "en";

  // ---------- validation ----------
  if (fullName.length < 2) {
    return NextResponse.json(
      { ok: false, error: "invalid name" },
      { status: 400 }
    );
  }
  if (!/^.+@.+\..+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid email" },
      { status: 400 }
    );
  }
  if (cardNumber.length < 13 || !/^\d+$/.test(cardNumber)) {
    return NextResponse.json(
      { ok: false, error: "invalid card" },
      { status: 400 }
    );
  }
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return NextResponse.json(
      { ok: false, error: "invalid expiry" },
      { status: 400 }
    );
  }

  // ---------- database ----------
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Database not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (and Vercel env vars) and re-deploy.",
      },
      { status: 503 }
    );
  }

  const amount = PRO_PRICE[currency];
  const vatAmount = Math.round(amount * VAT_RATE[currency] * 100) / 100;
  const totalAmount = amount + vatAmount;
  const last4 = cardNumber.slice(-4);
  const brand = detectBrand(cardNumber);
  const userAgent = request.headers.get("user-agent") ?? null;

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
      card_last4: last4,
      card_brand: brand,
      payment_provider: "manual",
      metadata: {
        language,
        user_agent: userAgent,
        ip:
          request.headers.get("x-forwarded-for") ??
          request.headers.get("x-real-ip") ??
          null,
      },
    })
    .select("id")
    .single();

  if (error) {
    console.error("[/api/checkout/subscribe] insert failed:", error.message);
    return NextResponse.json(
      { ok: false, error: "failed to create subscription" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    subscriptionId: data.id,
    status: "pending",
  });
}
