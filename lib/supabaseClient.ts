import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl && supabaseAnonKey
);

/**
 * Singleton Supabase client.
 *
 * Sessions are persisted to localStorage and auto-refreshed so the user
 * stays logged in across reloads and for months between visits. The client
 * is `null` when env vars are missing — the app keeps working fully offline
 * (local-only mode) in that case.
 */
export const supabase: SupabaseClient | null =
  isSupabaseConfigured && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

if (!isSupabaseConfigured && typeof window !== "undefined") {
  // One-time client-side hint when env vars are missing.
  // The app continues to function fully offline.
  console.info(
    "[AI DriveX] Supabase env vars missing — running in offline-only mode."
  );
}
