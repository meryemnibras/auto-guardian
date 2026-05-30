import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl && supabaseAnonKey
);

export const supabase: SupabaseClient | null =
  isSupabaseConfigured && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      })
    : null;

if (!isSupabaseConfigured && typeof window !== "undefined") {
  // One-time client-side hint when env vars are missing.
  // The app continues to function fully offline.
  console.info(
    "[AutoGuardian] Supabase env vars missing — running in offline-only mode."
  );
}
