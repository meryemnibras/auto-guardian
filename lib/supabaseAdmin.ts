/**
 * Server-only Supabase admin client.
 *
 * Uses the SERVICE_ROLE key — never import this from a client component.
 * The admin client bypasses Row Level Security so the API routes can write
 * subscriptions and read waitlist counts without exposing keys to the browser.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminConfigured: boolean = Boolean(
  supabaseUrl && supabaseServiceKey
);

let cached: SupabaseClient | null = null;

/**
 * Returns the admin client, or `null` if env vars are missing.
 * API routes should handle the `null` case gracefully — without crashing.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured) return null;
  if (cached) return cached;
  cached = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cached;
}
