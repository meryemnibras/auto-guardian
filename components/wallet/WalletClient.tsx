"use client";

import { useCallback, useState } from "react";
import { Wallet as WalletIcon } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { ExpenseForm } from "./ExpenseForm";
import { ReceiptScanner } from "./ReceiptScanner";
import { RecentTransactions } from "./RecentTransactions";
import { MaintenanceCountdowns } from "./MaintenanceCountdowns";
import { WalletSummary } from "./WalletSummary";
import { FuelLog } from "./FuelLog";

export function WalletClient() {
  const { t } = useTranslation();
  const [scannedAmount, setScannedAmount] = useState<number | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const handleScanned = useCallback((amount: number) => {
    setScannedAmount(amount);
  }, []);

  const handleSaved = useCallback(() => {
    setScannedAmount(null);
    setRefreshTick((n) => n + 1);
  }, []);

  return (
    <section className="flex flex-1 flex-col gap-5">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-100">
          <WalletIcon className="h-7 w-7 text-blue-300" aria-hidden />
          {t("smartWallet")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-gray-400">{t("walletIntro")}</p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <ReceiptScanner onAmountExtracted={handleScanned} />
          <ExpenseForm
            scannedAmount={scannedAmount}
            onSaved={handleSaved}
          />
        </div>

        <div className="space-y-5">
          <RecentTransactions refreshKey={refreshTick} />
          <WalletSummary />
          <FuelLog refreshKey={refreshTick} />
          <MaintenanceCountdowns />
        </div>
      </div>
    </section>
  );
}
