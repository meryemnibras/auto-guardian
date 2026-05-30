import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — AI DriveX",
  description: "Terms of use for the AI DriveX driver assistant.",
};

const LAST_UPDATED = "2026-05-28";

export default function TermsPage() {
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
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.5)]">
          <FileText className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500">Last updated: {LAST_UPDATED}</p>
        </div>
      </header>

      <article className="space-y-6 text-slate-300">
        <Disclaimer />

        <Section title="1. Acceptance">
          <p>
            By using AI DriveX, you agree to these terms. If you do not agree,
            do not use the app.
          </p>
        </Section>

        <Section title="2. Nature of the service">
          <p>
            AI DriveX is a <strong>personal productivity tool</strong> for
            drivers, providing expense tracking, maintenance reminders, fuel
            efficiency, parking memory, and AI-assisted explanations of
            OBD-II codes and engine sounds.
          </p>
          <p className="mt-2">
            <strong>It is not a replacement for:</strong>
          </p>
          <ul className="ms-5 mt-1 list-inside list-disc space-y-0.5 text-sm">
            <li>Professional mechanical diagnosis or repair.</li>
            <li>Official emergency services (police, ambulance, fire).</li>
            <li>Manufacturer service intervals or warranty terms.</li>
            <li>Licensed financial or accounting advice.</li>
          </ul>
        </Section>

        <Section title="3. AI-generated content">
          <p>
            Explanations from AI providers are <strong>best-effort</strong>{" "}
            and may be inaccurate, incomplete, or fabricated. Always verify
            critical information with a qualified mechanic, your vehicle
            manual, or an official source before acting on it.
          </p>
        </Section>

        <Section title="4. Emergency SOS feature">
          <p>
            The SOS panel opens your device&apos;s native messaging app with a
            pre-filled message containing your saved location. It{" "}
            <strong>does not automatically send</strong> the message and does
            not contact emergency services on your behalf. In a real
            emergency, call your local emergency number directly.
          </p>
        </Section>

        <Section title="5. Microphone &amp; GPS">
          <p>
            Browser permissions are required for the acoustic scanner and
            parking location features. You can deny or revoke these at any
            time without losing access to other features.
          </p>
        </Section>

        <Section title="6. Your data">
          <p>
            All data lives on your device by default. You are responsible for
            backing it up via{" "}
            <Link
              href="/settings"
              className="text-blue-400 hover:underline"
            >
              Settings → Export
            </Link>
            . We are not liable for data loss due to browser cache clearing,
            uninstallation, or device failure.
          </p>
        </Section>

        <Section title="7. No warranty">
          <p>
            AI DriveX is provided <strong>&quot;as is&quot;</strong> without
            warranty of any kind. We make no guarantees about accuracy,
            availability, or fitness for any particular purpose.
          </p>
        </Section>

        <Section title="8. Limitation of liability">
          <p>
            To the maximum extent permitted by law, we are not liable for any
            indirect, incidental, or consequential damages arising from your
            use of the app — including vehicle damage, missed maintenance, or
            incorrect AI advice.
          </p>
        </Section>

        <Section title="9. Changes">
          <p>
            We may update these terms. Continued use after changes
            constitutes acceptance.
          </p>
        </Section>

        <Section title="10. Governing law">
          <p>
            Use of this app is governed by the laws of the jurisdiction in
            which the operator resides. Disputes are resolved in that
            jurisdiction&apos;s courts.
          </p>
        </Section>

        <p className="text-center text-xs text-slate-600">
          See also our{" "}
          <Link href="/privacy" className="text-emerald-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </article>
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"
        aria-hidden
      />
      <p className="text-sm text-amber-100">
        AI DriveX is an experimental tool. Never rely on it alone for
        emergencies or critical mechanical decisions. Always consult certified
        professionals and call official emergency services when needed.
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <h2 className="mb-3 text-lg font-semibold text-slate-100">{title}</h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}
