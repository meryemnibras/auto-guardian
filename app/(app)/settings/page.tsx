"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Database,
  FileJson,
  FileText,
  Languages,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import {
  buildFullBackup,
  buildExpensesCsv,
  buildDiagnosticsCsv,
  buildLocationsCsv,
  countAll,
  clearAll,
  downloadBlob,
  timestampedFilename,
  restoreBackup,
  readFileAsText,
  type StorageCounts,
  type RestoreMode,
  type RestoreResult,
} from "@/lib/export/dataExport";
import type { SupportedLanguage } from "@/types/i18n";

const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ["ar", "en", "fr"];

const LOCALE_LABEL: Record<SupportedLanguage, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
};

export default function SettingsPage() {
  const { t, language, setLanguage } = useTranslation();
  const [counts, setCounts] = useState<StorageCounts | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreMode, setRestoreMode] = useState<RestoreMode>("merge");
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    setCounts(await countAll());
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const flash = useCallback((msg: string) => {
    setSuccess(msg);
    window.setTimeout(() => setSuccess(null), 2200);
  }, []);

  async function exportFullJson() {
    setBusy("json");
    try {
      const backup = await buildFullBackup();
      downloadBlob(
        JSON.stringify(backup, null, 2),
        timestampedFilename("ai-drivex-backup", "json"),
        "application/json"
      );
      flash("تم تنزيل النسخة الاحتياطية");
    } finally {
      setBusy(null);
    }
  }

  async function exportCsv(kind: "expenses" | "diagnostics" | "location") {
    setBusy(kind);
    try {
      const csv =
        kind === "expenses"
          ? await buildExpensesCsv()
          : kind === "diagnostics"
            ? await buildDiagnosticsCsv()
            : await buildLocationsCsv();
      downloadBlob(
        csv,
        timestampedFilename(`ai-drivex-${kind}`, "csv"),
        "text/csv;charset=utf-8"
      );
      flash("تم تنزيل الملف");
    } finally {
      setBusy(null);
    }
  }

  function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setRestoreFile(file);
    setRestoreResult(null);
    if (restoreInputRef.current) restoreInputRef.current.value = "";
  }

  async function doRestore() {
    if (!restoreFile) return;
    setBusy("restore");
    setRestoreResult(null);
    try {
      const text = await readFileAsText(restoreFile);
      const result = await restoreBackup(text, restoreMode);
      setRestoreResult(result);
      if (result.ok) {
        await reload();
        setRestoreFile(null);
        flash("تمت الاستعادة بنجاح");
      }
    } catch (e) {
      setRestoreResult({
        ok: false,
        inserted: {
          expenses: 0,
          diagnostics: 0,
          location: 0,
          chats: 0,
          maintenanceLog: 0,
          fuel: 0,
        },
        errors: [e instanceof Error ? e.message : String(e)],
      });
    } finally {
      setBusy(null);
    }
  }

  async function doClear() {
    setBusy("clear");
    try {
      await clearAll();
      await reload();
      setConfirmClear(false);
      flash("تم مسح جميع البيانات");
    } finally {
      setBusy(null);
    }
  }

  const totalRecords = counts
    ? counts.expenses + counts.diagnostics + counts.location + counts.chats
    : 0;

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-100">
          <SettingsIcon className="h-7 w-7 text-gray-300" aria-hidden />
          الإعدادات
        </h1>
        <p className="text-sm text-gray-400">
          أدر بيانات تطبيقك المحلية، صدّر نسخة احتياطية، وتحكّم في اللغة.
        </p>
      </header>

      {/* Storage stats */}
      <article className="space-y-3 rounded-3xl border border-gray-800 bg-gray-950/70 p-5 shadow-lg backdrop-blur">
        <header className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-300" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-100">التخزين المحلي</h2>
        </header>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Stat label="مصاريف" value={counts?.expenses} />
          <Stat label="فحوصات" value={counts?.diagnostics} />
          <Stat label="مواقع" value={counts?.location} />
          <Stat label="محادثات" value={counts?.chats} />
          <Stat label="صيانة" value={counts?.maintenanceLog} />
          <Stat label="وقود" value={counts?.fuel} />
        </div>
        <p className="text-[11px] text-gray-500">
          الإجمالي: {totalRecords} سجل محفوظ في IndexedDB على هذا الجهاز فقط.
        </p>
      </article>

      {/* Export */}
      <article className="space-y-3 rounded-3xl border border-gray-800 bg-gray-950/70 p-5 shadow-lg backdrop-blur">
        <header className="flex items-center gap-2">
          <Download className="h-5 w-5 text-emerald-300" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-100">تصدير البيانات</h2>
        </header>
        <p className="text-xs text-gray-400">
          ينزّل ملفاً على جهازك. لا يُرسل أي شيء لأي خادم.
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ExportButton
            icon={FileJson}
            label="نسخة احتياطية كاملة (JSON)"
            hint="كل الجداول في ملف واحد"
            onClick={exportFullJson}
            busy={busy === "json"}
            tone="emerald"
          />
          <ExportButton
            icon={FileText}
            label="المصاريف (CSV)"
            hint={`${counts?.expenses ?? 0} سجل`}
            onClick={() => exportCsv("expenses")}
            busy={busy === "expenses"}
            tone="blue"
          />
          <ExportButton
            icon={FileText}
            label="الفحوصات (CSV)"
            hint={`${counts?.diagnostics ?? 0} سجل`}
            onClick={() => exportCsv("diagnostics")}
            busy={busy === "diagnostics"}
            tone="violet"
          />
          <ExportButton
            icon={FileText}
            label="المواقع (CSV)"
            hint={`${counts?.location ?? 0} سجل`}
            onClick={() => exportCsv("location")}
            busy={busy === "location"}
            tone="cyan"
          />
        </div>
      </article>

      {/* Restore */}
      <article className="space-y-3 rounded-3xl border border-gray-800 bg-gray-950/70 p-5 shadow-lg backdrop-blur">
        <header className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-cyan-300" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-100">استعادة نسخة احتياطية</h2>
        </header>
        <p className="text-xs text-gray-400">
          استورد ملف JSON صادر سابقاً من هذه الصفحة. يدعم وضعَين: دمج مع البيانات
          الحالية، أو استبدالها بالكامل.
        </p>

        <input
          ref={restoreInputRef}
          type="file"
          accept="application/json,.json"
          onChange={onPickFile}
          className="hidden"
          aria-hidden
        />

        <button
          type="button"
          onClick={() => restoreInputRef.current?.click()}
          disabled={busy !== null}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FileJson className="h-4 w-4" aria-hidden />
          {restoreFile ? restoreFile.name : "اختر ملف JSON"}
        </button>

        {restoreFile && (
          <div className="space-y-2 rounded-2xl border border-gray-800 bg-gray-900/60 p-3">
            <div className="text-[11px] uppercase tracking-wider text-gray-500">
              وضع الاستعادة
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ModeButton
                active={restoreMode === "merge"}
                onClick={() => setRestoreMode("merge")}
                label="دمج"
                hint="إضافة للسجلات الحالية"
              />
              <ModeButton
                active={restoreMode === "replace"}
                onClick={() => setRestoreMode("replace")}
                label="استبدال"
                hint="حذف الحالي ثم استيراد"
                tone="rose"
              />
            </div>
            <button
              type="button"
              onClick={doRestore}
              disabled={busy === "restore"}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(34,211,238,0.55)] active:scale-[0.98] disabled:opacity-60"
            >
              {busy === "restore" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="h-4 w-4" aria-hidden />
              )}
              تنفيذ الاستعادة
            </button>
          </div>
        )}

        {restoreResult && (
          <div
            role="status"
            className={`space-y-1 rounded-2xl border p-3 text-xs ${
              restoreResult.ok
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-rose-500/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {restoreResult.ok ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden />
              ) : (
                <AlertTriangle className="h-4 w-4" aria-hidden />
              )}
              {restoreResult.ok ? "تمت الاستعادة" : "فشل الاستعادة"}
            </div>
            {restoreResult.ok && (
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span>مصاريف: {restoreResult.inserted.expenses}</span>
                <span>فحوصات: {restoreResult.inserted.diagnostics}</span>
                <span>مواقع: {restoreResult.inserted.location}</span>
                <span>محادثات: {restoreResult.inserted.chats}</span>
                <span>صيانة: {restoreResult.inserted.maintenanceLog}</span>
                <span>وقود: {restoreResult.inserted.fuel}</span>
              </div>
            )}
            {restoreResult.errors.length > 0 && (
              <ul className="list-inside list-disc text-[11px]">
                {restoreResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </article>

      {/* Language */}
      <article className="space-y-3 rounded-3xl border border-gray-800 bg-gray-950/70 p-5 shadow-lg backdrop-blur">
        <header className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-amber-300" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-100">اللغة</h2>
        </header>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLanguage(l)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors active:scale-95 ${
                language === l
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                  : "border-gray-800 bg-gray-900 text-gray-300 hover:border-amber-500/30"
              }`}
            >
              {LOCALE_LABEL[l]}
            </button>
          ))}
        </div>
      </article>

      {/* Danger zone */}
      <article className="space-y-3 rounded-3xl border border-rose-500/30 bg-rose-500/5 p-5 shadow-lg backdrop-blur">
        <header className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-400" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-100">منطقة الخطر</h2>
        </header>
        <p className="text-xs text-rose-200/80">
          هذا الإجراء يحذف كل البيانات المحلية نهائياً (مصاريف، فحوصات، مواقع،
          محادثات). لا يمكن التراجع. صدّر نسخة احتياطية أولاً.
        </p>

        {!confirmClear ? (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            disabled={busy !== null || totalRecords === 0}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            مسح كل البيانات المحلية
          </button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              disabled={busy === "clear"}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-800 bg-gray-900 px-4 text-sm font-medium text-gray-300 active:scale-[0.98]"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={doClear}
              disabled={busy === "clear"}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(244,63,94,0.6)] active:scale-[0.98] disabled:opacity-60"
            >
              {busy === "clear" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden />
              )}
              نعم، احذف الكل
            </button>
          </div>
        )}
      </article>

      {success && (
        <div
          role="status"
          className="fixed bottom-24 inset-x-0 mx-auto flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-xs text-emerald-200 shadow-lg backdrop-blur"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          {success}
        </div>
      )}

      <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-gray-800 pt-4 text-[11px] text-gray-500">
        <a
          href="/privacy"
          className="hover:text-gray-300 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          سياسة الخصوصية
        </a>
        <span className="text-gray-700">·</span>
        <a
          href="/terms"
          className="hover:text-gray-300 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          شروط الاستخدام
        </a>
        <span className="text-gray-700">·</span>
        <span>AI DriveX v1.0</span>
      </footer>
    </section>
  );
}

function ModeButton({
  active,
  onClick,
  label,
  hint,
  tone = "cyan",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
  tone?: "cyan" | "rose";
}) {
  const activeClass =
    tone === "rose"
      ? "border-rose-500/40 bg-rose-500/15 text-rose-200"
      : "border-cyan-500/40 bg-cyan-500/15 text-cyan-200";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-2 text-start text-xs transition-colors active:scale-95 ${
        active
          ? activeClass
          : "border-gray-800 bg-gray-950 text-gray-300 hover:border-gray-700"
      }`}
    >
      <div className="font-semibold">{label}</div>
      <div className="text-[10px] opacity-70">{hint}</div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 text-center">
      <div className="text-2xl font-extrabold text-gray-100">
        {value === undefined ? "—" : value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-500">
        {label}
      </div>
    </div>
  );
}

type Tone = "emerald" | "blue" | "violet" | "cyan";

const TONE_CLASSES: Record<Tone, string> = {
  emerald:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20",
  violet:
    "border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20",
};

function ExportButton({
  icon: Icon,
  label,
  hint,
  onClick,
  busy,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  onClick: () => void;
  busy: boolean;
  tone: Tone;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`flex items-center gap-3 rounded-2xl border p-3 text-start transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${TONE_CLASSES[tone]}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gray-950/40">
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Icon className="h-4 w-4" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[11px] opacity-70">{hint}</div>
      </div>
    </button>
  );
}
