"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { formatMoney, formatNumber } from "@/lib/format";

export interface CategoryProduct {
  nombre: string;
  cantidad: number;
  total: number;
}
export interface CategoryRow {
  categoria: string;
  total: number;
  qty: number;
  products: CategoryProduct[];
}

export function CategoryReportList({ categories }: { categories: CategoryRow[] }) {
  const [selected, setSelected] = useState<CategoryRow | null>(null);
  const grand = categories.reduce((a, c) => a + c.total, 0);

  return (
    <>
      <div className="flex flex-col divide-y divide-border/50">
        {categories.map((c) => {
          const pct = grand > 0 ? Math.round((c.total / grand) * 100) : 0;
          return (
            <button
              key={c.categoria}
              type="button"
              onClick={() => setSelected(c)}
              className="flex min-w-0 flex-col gap-2 px-5 py-4 text-left transition-colors hover:bg-secondary/40 active:bg-secondary/60"
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span className="min-w-0 truncate font-display text-[15px] font-semibold text-foreground">
                  {c.categoria}{" "}
                  <span className="font-display text-[13px] font-medium text-muted-foreground">
                    ({formatNumber(c.qty)} und.)
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 font-display text-[15px] font-bold text-foreground">
                  {formatMoney(c.total)}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </span>
              </div>
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-9 shrink-0 text-right text-[11px] font-semibold text-muted-foreground">{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>

      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          {selected && (
            <div className="flex min-w-0 flex-col gap-5 p-5 pt-8">
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Resumen de categoría</p>
                <h3 className="truncate font-display text-[22px] font-extrabold tracking-tight text-foreground">
                  {selected.categoria}
                </h3>
              </div>
              <div className="rounded-[20px] bg-primary p-5 text-white">
                <p className="text-[13px] font-medium text-white/85">Total vendido</p>
                <p className="truncate font-display text-3xl font-extrabold">{formatMoney(selected.total)}</p>
                <p className="mt-1 text-[13px] text-white/85">
                  {formatNumber(selected.qty)} und. · {selected.products.length} productos
                </p>
              </div>
              <div className="flex flex-col divide-y divide-border/50 rounded-[20px] border border-border/60 bg-card">
                {selected.products.map((p, i) => (
                  <div key={`${p.nombre}-${i}`} className="flex min-w-0 items-center gap-3 px-4 py-3.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[15px] font-semibold text-foreground">{p.nombre}</p>
                      <p className="text-[13px] text-muted-foreground">{formatNumber(p.cantidad)} und.</p>
                    </div>
                    <span className="shrink-0 font-display text-[15px] font-bold text-foreground">
                      {formatMoney(p.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
