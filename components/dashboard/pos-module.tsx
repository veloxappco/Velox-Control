"use client";

import { useState } from "react";
import { Armchair, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { PosAccountsModule } from "@/components/dashboard/pos-accounts-module";
import { PosSalesModule } from "@/components/dashboard/pos-sales-module";
import type { PosAccount, PosSaleListItem } from "@/lib/api/types";

// Ventas POS: "Abiertas" (mesas y ventas rápidas sin cerrar: se pueden quitar
// productos) y "Cobradas" (ya cerradas: solo consulta).
export function PosModule({
  accounts,
  sales,
  salesTotal,
}: {
  accounts: PosAccount[];
  sales: PosSaleListItem[];
  salesTotal: number;
}) {
  const openCount = accounts.filter((a) => a.status !== "paid").length;
  const [view, setView] = useState<"open" | "paid">(openCount > 0 ? "open" : "paid");

  const chips = [
    { key: "open" as const, label: "Abiertas", count: openCount, icon: Armchair },
    { key: "paid" as const, label: "Cobradas", count: salesTotal, icon: Receipt },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex gap-2">
        {chips.map(({ key, label, count, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-display text-xs font-semibold transition-all duration-200",
                active
                  ? "border-transparent bg-primary text-white shadow-md shadow-primary/25"
                  : "border-border bg-card text-foreground/70 hover:bg-secondary/40"
              )}
            >
              <Icon className={cn("size-3.5", active ? "text-white" : "text-primary")} />
              {label}
              <span className={active ? "text-white/80" : "text-muted-foreground"}>({count})</span>
            </button>
          );
        })}
      </div>

      {view === "open" ? (
        <PosAccountsModule accounts={accounts} embedded />
      ) : (
        <PosSalesModule sales={sales} total={salesTotal} embedded />
      )}
    </div>
  );
}
