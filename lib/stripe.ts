/**
 * Server-only Stripe client.
 *
 * Never import this from a client component — STRIPE_SECRET_KEY must stay
 * on the server. Returns `null` if no key is configured so API routes can
 * gracefully degrade instead of crashing the whole deploy.
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const isStripeConfigured: boolean = Boolean(key && key.length > 0);

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!isStripeConfigured) return null;
  if (cached) return cached;
  // Cast the api version to the SDK's discriminated literal so we don't
  // have to pin to whatever 4-week window the SDK currently knows about.
  cached = new Stripe(key!, {
    appInfo: { name: "AI DriveX", version: "0.1.0" },
  });
  return cached;
}
