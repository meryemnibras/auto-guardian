"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  Activity,
  Wallet,
  ShieldAlert,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "./LanguageProvider";
import type { TranslationKey } from "@/types/i18n";

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
}

const ITEMS: NavItem[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/chat", labelKey: "chat", icon: MessageCircle },
  { href: "/diagnostics", labelKey: "diagnostics", icon: Activity },
  { href: "/wallet", labelKey: "wallet", icon: Wallet },
  { href: "/emergency", labelKey: "emergency", icon: ShieldAlert },
  { href: "/settings", labelKey: "settingsLabel", icon: SettingsIcon },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNavigation() {
  const { t } = useTranslation();
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:border-white/5 dark:bg-gray-950/90 dark:supports-[backdrop-filter]:bg-gray-950/70"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-1 py-2">
        {ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex w-full flex-col items-center gap-1 rounded-xl px-0.5 py-2 text-[10px] leading-none transition-all duration-200 active:scale-95 ${
                  active
                    ? "bg-slate-100 text-slate-900 dark:bg-white/5 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-sky-400" : ""
                  }`}
                  aria-hidden
                />
                <span className="max-w-full truncate">{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
