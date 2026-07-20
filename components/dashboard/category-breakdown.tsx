"use client";

import { useMemo, useState } from "react";
import { Tags } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime, formatMoney, paymentMethodLabel } from "@/lib/format";
import type { CashExpenseCategoryBreakdown, ExpenseMovement } from "@/lib/api/types";

export function CategoryBreakdown({
  categories,
  movements,
  total,
}: {
  categories: CashExpenseCategoryBreakdown[];
  movements: ExpenseMovement[];
  total: number;
}) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const activeSummary = categories.find((c) => c.category === openCategory);
  const activeMovements = useMemo(
    () => (openCategory ? movements.filter((m) => m.category === openCategory) : []),
    [movements, openCategory]
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Egresos por categoría</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Tags} title="Sin egresos en este periodo" />
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/60">
              {categories.map((c) => {
                const pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
                return (
                  <button
                    key={c.category}
                    type="button"
                    onClick={() => setOpenCategory(c.category)}
                    className="flex min-w-0 flex-col gap-1.5 px-5 py-3.5 text-left transition-colors hover:bg-secondary/40 active:bg-secondary/60"
                  >
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-medium">
                        {c.category}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({c.count})
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-medium">{formatMoney(c.total)}</span>
                    </div>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-gradient-brand transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={openCategory !== null} onOpenChange={(open) => !open && setOpenCategory(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <div className="flex min-w-0 flex-col gap-4 p-5 pt-8">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Categoría</p>
              <h3 className="truncate text-lg font-semibold">{openCategory}</h3>
              {activeSummary && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {activeSummary.count} movimientos · {formatMoney(activeSummary.total)}
                </p>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              {activeMovements.length === 0 ? (
                <EmptyState icon={Tags} title="Sin movimientos" />
              ) : (
                activeMovements.map((m) => (
                  <div key={m.id} className="min-w-0 rounded-lg border border-border/60 p-3.5">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium">
                          {m.description?.trim() || "Sin descripción"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDateTime(m.created_at)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-destructive">
                        -{formatMoney(m.amount)}
                      </span>
                    </div>
                    {m.payment_method && (
                      <Badge variant="outline" className="mt-2">
                        {paymentMethodLabel(m.payment_method)}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
