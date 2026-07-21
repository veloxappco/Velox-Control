"use client";

import { useMemo, useState } from "react";
import { Tags } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime, formatMoney, paymentMethodBadgeVariant, paymentMethodLabel } from "@/lib/format";
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
      <Card className="overflow-hidden rounded-[20px] p-0 shadow-sm">
        <div className="flex items-center gap-3 p-5 pb-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-warning/10">
            <Tags className="size-6 text-warning" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-foreground">Egresos por categoría</h3>
            <p className="text-sm text-muted-foreground">Distribución del gasto en el periodo</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState icon={Tags} title="Sin egresos en este periodo" />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border/50">
            {categories.map((c) => {
              const pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
              return (
                <button
                  key={c.category}
                  type="button"
                  onClick={() => setOpenCategory(c.category)}
                  className="flex min-w-0 flex-col gap-2 px-5 py-4 text-left transition-all duration-200 hover:bg-secondary/30 active:bg-secondary/50"
                >
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <span className="min-w-0 truncate font-display text-base font-semibold text-foreground">
                      {c.category}{" "}
                      <span className="font-display text-sm font-medium text-muted-foreground">
                        ({c.count})
                      </span>
                    </span>
                    <span className="shrink-0 font-display text-base font-bold text-foreground">
                      {formatMoney(c.total)}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-success transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-9 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Sheet open={openCategory !== null} onOpenChange={(open) => !open && setOpenCategory(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <div className="flex min-w-0 flex-col gap-4 p-5 pt-8">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Categoría</p>
              <h3 className="truncate font-display text-2xl font-extrabold tracking-tight text-foreground">
                {openCategory}
              </h3>
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
                      <Badge variant={paymentMethodBadgeVariant(m.payment_method)} className="mt-2">
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
