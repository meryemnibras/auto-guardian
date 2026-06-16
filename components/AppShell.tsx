import type { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { SyncStatusIndicator } from "./sync/SyncStatusIndicator";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
      <SyncStatusIndicator />
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-12 pb-28">
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
}
