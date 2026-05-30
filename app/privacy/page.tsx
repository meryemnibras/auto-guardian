import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — AI DriveX",
  description:
    "How AI DriveX handles your data: local-first by design, zero tracking, no third-party analytics.",
};

const LAST_UPDATED = "2026-05-28";

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to app
      </Link>

      <header className="mb-8 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)]">
          <Shield className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">Last updated: {LAST_UPDATED}</p>
        </div>
      </header>

      <article className="space-y-8 text-slate-300">
        <Section title="Summary" tone="emerald">
          <p>
            AI DriveX is built <strong>local-first</strong>. Your expense
            records, diagnostics, parking locations, fuel log, and chat history
            live in <strong>your browser only</strong>, never on our servers.
            We do not run any analytics, telemetry, or tracking pixels.
          </p>
        </Section>

        <Section title="What we store locally">
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>
              Expenses, diagnostics, GPS coordinates of your parked car, fuel
              fill-ups, maintenance log, and AI chat history — all in
              IndexedDB (your browser&apos;s built-in storage).
            </li>
            <li>
              Your language preference and UI settings — in IndexedDB or
              localStorage.
            </li>
            <li>
              No data leaves your device unless you explicitly:
              <ul className="ms-5 mt-1 list-inside list-disc space-y-0.5">
                <li>
                  Press &quot;Ask AI assistant&quot; (sends your question to an
                  AI provider).
                </li>
                <li>
                  Enable cloud sync with Supabase (uploads expenses &amp;
                  diagnostics for cross-device access).
                </li>
                <li>
                  Press &quot;Send SOS&quot; (opens your messaging app — does
                  not send anything automatically).
                </li>
              </ul>
            </li>
          </ul>
        </Section>

        <Section title="AI providers">
          <p>
            When you ask an AI question, the text you type is sent to one of
            the configured providers (Anthropic Claude, Google Gemini, or
            OpenAI) over HTTPS. Their respective privacy policies apply to
            that transmission. We do not log or retain your prompts on our
            side.
          </p>
        </Section>

        <Section title="Microphone &amp; location">
          <p>
            Both require your explicit browser permission each session. The
            microphone is used <strong>only</strong> to time a 5-second
            window and trigger an animated visualization — no audio is
            recorded, processed, transcribed, or transmitted. GPS coordinates
            are stored in IndexedDB only when you press &quot;Save car
            location&quot;.
          </p>
        </Section>

        <Section title="Data export &amp; deletion">
          <p>
            You can export everything as JSON or CSV from{" "}
            <Link
              href="/settings"
              className="text-emerald-400 hover:underline"
            >
              Settings
            </Link>
            , or wipe all local data with a single click. Both actions are
            instant and final.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            None. We use no cookies, no localStorage tracking, no third-party
            scripts.
          </p>
        </Section>

        <Section title="Children">
          <p>
            AI DriveX is intended for licensed drivers (typically 18+). We do
            not knowingly collect data from anyone since we do not collect data
            in the first place.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If this policy changes materially, the &quot;Last updated&quot;
            date above changes. Major changes will be announced in the app.
          </p>
        </Section>

        <Section title="Contact" tone="cyan">
          <p>
            Questions? File an issue on the project repository, or reach out
            via the contact details in the app footer.
          </p>
        </Section>
      </article>
    </div>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "emerald" | "cyan";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border p-5 ${
        tone === "emerald"
          ? "border-emerald-500/30 bg-emerald-500/5"
          : tone === "cyan"
            ? "border-cyan-500/30 bg-cyan-500/5"
            : "border-slate-800 bg-slate-900/40"
      }`}
    >
      <h2 className="mb-3 text-lg font-semibold text-slate-100">{title}</h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}
