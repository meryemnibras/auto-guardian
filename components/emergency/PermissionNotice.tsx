"use client";

import { Info, AlertTriangle, AlertCircle, type LucideIcon } from "lucide-react";
import type { PermissionNoticeTone } from "@/types/emergency";

interface PermissionNoticeProps {
  title?: string;
  description: string;
  tone?: PermissionNoticeTone;
}

const STYLE: Record<
  PermissionNoticeTone,
  { ring: string; bg: string; text: string; Icon: LucideIcon }
> = {
  info: {
    ring: "border-blue-500/30",
    bg: "bg-blue-500/10",
    text: "text-blue-200",
    Icon: Info,
  },
  warning: {
    ring: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-200",
    Icon: AlertTriangle,
  },
  error: {
    ring: "border-rose-500/30",
    bg: "bg-rose-500/10",
    text: "text-rose-200",
    Icon: AlertCircle,
  },
};

export function PermissionNotice({
  title,
  description,
  tone = "info",
}: PermissionNoticeProps) {
  const s = STYLE[tone];
  const Icon = s.Icon;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-2xl border p-3 text-xs ${s.ring} ${s.bg} ${s.text}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="space-y-0.5">
        {title && <div className="font-semibold">{title}</div>}
        <div className="text-current/90">{description}</div>
      </div>
    </div>
  );
}
