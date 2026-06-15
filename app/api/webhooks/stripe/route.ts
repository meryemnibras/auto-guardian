/**
 * POST /api/webhooks/stripe
 *
 * Receives webhook events from Stripe, verifies the signature, then:
 *   • On `checkout.session.completed` — marks the matching subscription
 *     row as `active`, stores the Stripe customer/subscription IDs, and
 *     sends a branded receipt email + founder notification.
 *   • On `customer.subscription.deleted` / `invoice.payment_failed` —
 *     flips the row to `canceled` / `past_due` so the dashboard stays
 *     accurate.
 *
 * Set STRIPE_WEBHOOK_SECRET to the secret shown in the Stripe Dashboard
 * → Developers → Webhooks → (your endpoint) → Reveal signing secret.
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail, NOTIFY_EMAIL } from "@/lib/resend";
import {
  subscriptionReceiptEmail,
  founderNotifyEmail,
} from "@/lib/emails";
import type { Currency } from "@/lib/currency";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function isCurrency(v: string | undefined): v is Currency {
  return v === "SAR" || v === "USD" || v === "EUR";
}

export async function POST(request: Request) {
  if (!isStripeConfigured || !WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "stripe webhook not configured" },
      { status: 503 }
    );
  }

  const stripe = getStripe()!;
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  // Stripe requires the RAW body to verify the HMAC signature — must not
  // be parsed with request.json() first.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[stripe webhook] signature verification failed:", msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        // We intentionally ignore other events.
        break;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[stripe webhook] handler ${event.type} threw:`, msg);
    // Return 200 anyway so Stripe doesn't keep retrying for our own bugs.
    return NextResponse.json({ received: true, handler_error: msg });
  }

  return NextResponse.json({ received: true });
}

/* ------------------------------------------------------------------ */
/* Handlers                                                             */
/* ------------------------------------------------------------------ */

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const admin = getSupabaseAdmin();
  const subscriptionId = session.metadata?.subscription_id || null;
  const language =
    session.metadata?.language === "ar" ? "ar" : ("en" as "ar" | "en");
  const currency =
    isCurrency(session.metadata?.currency) ? (session.metadata!.currency as Currency) : "SAR";
  const fullName = session.metadata?.full_name || null;
  const email =
    session.customer_details?.email ||
    session.customer_email ||
    "";
  const totalAmount = (session.amount_total ?? 0) / 100;
  const vatAmount = 0; // We embedded VAT in the unit price already.
  const startsAt = new Date().toISOString();

  // Update subscription row — by id if we have one, otherwise by email
  if (admin) {
    const update = {
      status: "active",
      starts_at: startsAt,
      payment_intent_id: session.id,
      metadata: {
        language,
        stripe_session_id: session.id,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
      },
    } as const;

    if (subscriptionId) {
      await admin.from("subscriptions").update(update).eq("id", subscriptionId);
    } else if (email) {
      await admin
        .from("subscriptions")
        .update(update)
        .eq("email", email)
        .eq("status", "pending");
    }
  }

  // Send receipt to buyer
  if (email) {
    const receipt = subscriptionReceiptEmail({
      email,
      fullName,
      currency,
      totalAmount,
      vatAmount,
      subscriptionId: subscriptionId ?? session.id,
      language,
    });
    await sendEmail({
      to: email,
      subject: receipt.subject,
      html: receipt.html,
    });
  }

  // Notify the founder
  if (NOTIFY_EMAIL && email) {
    const notif = founderNotifyEmail({
      kind: "subscription",
      email,
      fullName,
      currency,
      totalAmount,
      subscriptionId: subscriptionId ?? session.id,
    });
    await sendEmail({
      to: NOTIFY_EMAIL,
      subject: notif.subject,
      html: notif.html,
      replyTo: email,
    });
  }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const stripeSubId = sub.id;
  await admin
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
    })
    .filter("metadata->>stripe_subscription_id", "eq", stripeSubId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  // `subscription` lives on Invoice at runtime but isn't on the strict
  // TS type in newer SDK versions — read it dynamically.
  const rawSub = (invoice as unknown as { subscription?: string | { id?: string } })
    .subscription;
  const stripeSubId =
    typeof rawSub === "string" ? rawSub : rawSub?.id ?? null;
  if (!stripeSubId) return;
  await admin
    .from("subscriptions")
    .update({ status: "past_due" })
    .filter("metadata->>stripe_subscription_id", "eq", stripeSubId);
}
