"use client";

import { useState } from "react";
import { BarChart3, ChevronRight, Medal, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { formatMoney, formatNumber } from "@/lib/format";
import type { TopProductItem } from "@/lib/api/types";

// Un color muy sutil por posición del podio — mismo verde/azul/naranja que
// el resto de la app, pero en los tonos pastel de Tailwind (50/100/700) que
// no tenemos como token propio.
const RANK_STYLES = {
  1: {
    border: "border-green-100",
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    iconText: "text-green-600",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
  },
  2: {
    border: "border-blue-100",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  3: {
    border: "border-orange-100",
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconText: "text-orange-600",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
  },
} as const;

const REVEAL_CHUNK = 20;

export function TopProductsPodium({ products }: { products: TopProductItem[] }) {
  const [showAll, setShowAll] = useState(false);

  if (products.length === 0) {
    return (
      <Card className="rounded-[20px] p-5 shadow-sm">
        <Header />
        <div className="mt-5">
          <EmptyState icon={Trophy} title="Sin ventas de productos en este periodo" />
        </div>
      </Card>
    );
  }

  const top3 = products.slice(0, 3);
  // El endpoint permite máximo 20 productos, así que "cada 20" equivale a
  // revelar el resto del ranking de una vez, detrás de un botón.
  const rest = products.slice(3, REVEAL_CHUNK);

  return (
    <Card className="rounded-[20px] p-5 shadow-sm">
      <Header />

      <div className="mt-5 flex flex-col gap-3">
        {top3.map((product, index) => {
          const rank = (index + 1) as 1 | 2 | 3;
          const styles = RANK_STYLES[rank];
          return (
            <div
              key={product.producto_id ?? rank}
              className={cn(
                "flex min-w-0 items-center gap-3 rounded-[20px] border p-4",
                styles.border,
                styles.bg
              )}
            >
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-full",
                  styles.iconBg
                )}
              >
                <Medal className={cn("size-5", styles.iconText)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-semibold text-foreground">
                  {product.nombre_producto}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatNumber(product.cantidad_vendida)} unidades
                </p>
              </div>
              <div
                className={cn(
                  "shrink-0 rounded-xl px-3 py-2 font-display text-lg font-bold",
                  styles.badgeBg,
                  styles.badgeText
                )}
              >
                {formatMoney(product.total_vendido)}
              </div>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center justify-between gap-3 rounded-[20px] border border-border/60 bg-card px-4 py-3.5 text-left shadow-sm transition-all duration-200 hover:bg-secondary/30 hover:shadow-md active:scale-[0.99]"
          >
            <span className="flex items-center gap-2.5 font-display text-sm font-semibold text-primary">
              <BarChart3 className="size-4 shrink-0" />
              {showAll ? "Ver menos" : `Ver ranking completo (${rest.length} más)`}
            </span>
            <ChevronRight
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                showAll && "rotate-90"
              )}
            />
          </button>

          {showAll && (
            <div className="flex flex-col divide-y divide-border/50">
              {rest.map((p, i) => (
                <div key={p.producto_id ?? i} className="flex min-w-0 items-center gap-3 py-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-[15px] font-medium text-foreground/80">
                    {i + 4}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg font-semibold text-foreground">
                      {p.nombre_producto}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formatNumber(p.cantidad_vendida)} unidades
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-lg font-bold text-foreground">
                    {formatMoney(p.total_vendido)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
        <Trophy className="size-6 text-primary" />
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold text-foreground">Top de productos</h3>
        <p className="text-sm text-muted-foreground">Los productos más vendidos</p>
      </div>
    </div>
  );
}
