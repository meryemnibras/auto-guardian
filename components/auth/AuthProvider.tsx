"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export interface AuthResult {
  ok: boolean;
  error?: string;
  /** True for sign-up when email confirmation is required before login. */
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  /** True once the initial session check has finished. */
  ready: boolean;
  /** Whether Supabase is configured at all (env vars present). */
  configured: boolean;
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "البريد أو كلمة المرور غير صحيحة.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "هذا البريد مسجّل مسبقًا. سجّل الدخول بدلاً من ذلك.";
  if (m.includes("password")) return "كلمة المرور ضعيفة (6 أحرف على الأقل).";
  if (m.includes("email")) return "البريد الإلكتروني غير صالح.";
  if (m.includes("network") || m.includes("fetch"))
    return "تعذّر الاتصال بالخادم. تحقق من الإنترنت.";
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setReady(true);
      })
      .catch(() => {
        if (active) setReady(true);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { ok: false, error: "السحابة غير مُهيّأة." };
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { ok: false, error: friendlyError(error.message) };
      // When email confirmation is ON, there is a user but no active session.
      const needsConfirmation = Boolean(data.user) && !data.session;
      return { ok: true, needsConfirmation };
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { ok: false, error: "السحابة غير مُهيّأة." };
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { ok: false, error: friendlyError(error.message) };
      return { ok: true };
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured: isSupabaseConfigured,
      user: session?.user ?? null,
      session,
      signUp,
      signIn,
      signOut,
    }),
    [ready, session, signUp, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
