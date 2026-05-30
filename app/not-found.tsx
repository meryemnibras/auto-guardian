import Link from "next/link";
import { Compass, Home, Wallet, Activity, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Not Found — AI DriveX",
};

const LINKS = [
  { href: "/", label: "الرئيسية", Icon: Home },
  { href: "/diagnostics", label: "الفحص", Icon: Activity },
  { href: "/wallet", label: "المحفظة", Icon: Wallet },
  { href: "/emergency", label: "الطوارئ", Icon: ShieldAlert },
];

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_12px_36px_-12px_rgba(34,211,238,0.55)]">
        <Compass className="h-8 w-8" aria-hidden />
      </span>

      <div className="space-y-2">
        <h1 className="text-6xl font-extrabold tracking-tight text-slate-100">
          404
        </h1>
        <p className="text-sm text-slate-400">
          الصفحة التي تبحث عنها غير موجودة.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-2">
        {LINKS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 text-xs font-medium text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-900 active:scale-[0.98]"
          >
            <Icon className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
