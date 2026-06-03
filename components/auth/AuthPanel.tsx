"use client";

import { useState, type FormEvent } from "react";
import {
  CloudOff,
  LogIn,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { useAuth } from "./AuthProvider";
import { useCloudSync } from "@/hooks/useCloudSync";
import type { SupportedLanguage } from "@/types/i18n";

type Mode = "login" | "signup";

const STR: Record<SupportedLanguage, Record<string, string>> = {
  ar: {
    title: "الحساب والمزامنة السحابية",
    notConfigured:
      "المزامنة السحابية غير مُفعّلة بعد. التطبيق يعمل بالكامل محليًا. أضِف مفاتيح Supabase لتفعيل الحساب والحفظ الدائم.",
    signedInAs: "مسجّل الدخول باسم",
    syncNow: "مزامنة الآن",
    syncing: "جارٍ المزامنة…",
    lastSync: "آخر مزامنة",
    never: "لم تتم بعد",
    signOut: "تسجيل الخروج",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    haveAccount: "لديك حساب؟ سجّل الدخول",
    noAccount: "ليس لديك حساب؟ أنشئ واحدًا",
    working: "جارٍ…",
    confirmEmail:
      "تم إنشاء الحساب! تحقق من بريدك وفعّل الحساب عبر الرابط ثم سجّل الدخول.",
    secure: "بياناتك معزولة ومحمية — لا أحد يراها سواك.",
    syncDone: "تمت المزامنة بنجاح",
    syncError: "خطأ في المزامنة",
  },
  en: {
    title: "Account & Cloud Sync",
    notConfigured:
      "Cloud sync is not enabled yet. The app works fully offline. Add Supabase keys to enable accounts and permanent storage.",
    signedInAs: "Signed in as",
    syncNow: "Sync now",
    syncing: "Syncing…",
    lastSync: "Last sync",
    never: "Never",
    signOut: "Sign out",
    login: "Log in",
    signup: "Create account",
    email: "Email",
    password: "Password",
    haveAccount: "Have an account? Log in",
    noAccount: "No account? Create one",
    working: "Working…",
    confirmEmail:
      "Account created! Check your email and confirm via the link, then log in.",
    secure: "Your data is isolated and protected — only you can see it.",
    syncDone: "Synced successfully",
    syncError: "Sync error",
  },
  fr: {
    title: "Compte et synchronisation cloud",
    notConfigured:
      "La synchronisation cloud n'est pas encore activée. L'application fonctionne entièrement hors ligne. Ajoutez les clés Supabase pour activer les comptes et le stockage permanent.",
    signedInAs: "Connecté en tant que",
    syncNow: "Synchroniser",
    syncing: "Synchronisation…",
    lastSync: "Dernière synchro",
    never: "Jamais",
    signOut: "Se déconnecter",
    login: "Se connecter",
    signup: "Créer un compte",
    email: "E-mail",
    password: "Mot de passe",
    haveAccount: "Vous avez un compte ? Connectez-vous",
    noAccount: "Pas de compte ? Créez-en un",
    working: "En cours…",
    confirmEmail:
      "Compte créé ! Vérifiez votre e-mail et confirmez via le lien, puis connectez-vous.",
    secure: "Vos données sont isolées et protégées — vous seul pouvez les voir.",
    syncDone: "Synchronisé avec succès",
    syncError: "Erreur de synchronisation",
  },
};

export function AuthPanel() {
  const { language } = useTranslation();
  const t = STR[language] ?? STR.en;
  const { ready, configured, user, signIn, signUp, signOut } = useAuth();
  const { status, isSyncing, lastSyncedAt, syncData } = useCloudSync();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // --- Cloud not configured -------------------------------------------------
  if (!configured) {
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex items-center gap-2 text-slate-200">
          <CloudOff className="h-5 w-5 text-amber-400" aria-hidden />
          <h2 className="text-base font-semibold">{t.title}</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          {t.notConfigured}
        </p>
      </section>
    );
  }

  // --- Loading initial session ---------------------------------------------
  if (!ready) {
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
          <span className="text-sm">{t.working}</span>
        </div>
      </section>
    );
  }

  // --- Signed in ------------------------------------------------------------
  if (user) {
    const lastSyncLabel = lastSyncedAt
      ? new Date(lastSyncedAt).toLocaleString()
      : t.never;
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex items-center gap-2 text-slate-200">
          <ShieldCheck className="h-5 w-5 text-emerald-400" aria-hidden />
          <h2 className="text-base font-semibold">{t.title}</h2>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <Mail className="h-4 w-4 shrink-0 text-sky-400" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs text-slate-400">{t.signedInAs}</p>
            <p className="truncate text-sm font-medium text-slate-100">
              {user.email}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>
            {t.lastSync}: {lastSyncLabel}
          </span>
          {status === "synced" && (
            <span className="text-emerald-400">{t.syncDone}</span>
          )}
          {status === "error" && (
            <span className="text-rose-400">{t.syncError}</span>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => void syncData()}
            disabled={isSyncing}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
              aria-hidden
            />
            {isSyncing ? t.syncing : t.syncNow}
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {t.signOut}
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-500">{t.secure}</p>
      </section>
    );
  }

  // --- Signed out: login / signup form -------------------------------------
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const result =
        mode === "signup"
          ? await signUp(email.trim(), password)
          : await signIn(email.trim(), password);
      if (!result.ok) {
        setError(result.error ?? "حدث خطأ");
      } else if (result.needsConfirmation) {
        setNotice(t.confirmEmail);
        setMode("login");
        setPassword("");
      }
      // On successful login, AuthProvider flips `user` and this form unmounts.
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex items-center gap-2 text-slate-200">
        <ShieldCheck className="h-5 w-5 text-sky-400" aria-hidden />
        <h2 className="text-base font-semibold">{t.title}</h2>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t.email}</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500/60"
            placeholder="you@example.com"
            dir="ltr"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">
            {t.password}
          </label>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500/60"
            placeholder="••••••••"
            dir="ltr"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
        >
          {mode === "signup" ? (
            <UserPlus className="h-4 w-4" aria-hidden />
          ) : (
            <LogIn className="h-4 w-4" aria-hidden />
          )}
          {busy ? t.working : mode === "signup" ? t.signup : t.login}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "login" ? "signup" : "login"));
          setError(null);
          setNotice(null);
        }}
        className="mt-3 w-full text-center text-xs text-sky-400 transition hover:text-sky-300"
      >
        {mode === "login" ? t.noAccount : t.haveAccount}
      </button>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">{t.secure}</p>
    </section>
  );
}
