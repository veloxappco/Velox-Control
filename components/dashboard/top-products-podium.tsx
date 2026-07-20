"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { formatMoney, formatNumber } from "@/lib/format";
import type { TopProductItem } from "@/lib/api/types";

// Orden visual del podio: 2° a la izquierda, 1° al centro (más alto),
// 3° a la derecha — con `order-*` reacomodamos el orden del DOM.
const PODIUM = [
  { rank: 1, visualOrder: "order-2", height: "h-24", medal: "🥇", badge: "bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950" },
  { rank: 2, visualOrder: "order-1", height: "h-16", medal: "🥈", badge: "bg-gradient-to-b from-slate-300 to-slate-400 text-slate-900" },
  { rank: 3, visualOrder: "order-3", height: "h-12", medal: "🥉", badge: "bg-gradient-to-b from-orange-300 to-orange-500 text-orange-950" },
] as const;

const REVEAL_CHUNK = 20;

export function TopProductsPodium({ products }: { products: TopProductItem[] }) {
  const [showAll, setShowAll] = useState(false);

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-4" /> Top de productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState icon={Trophy} title="Sin ventas de productos en este periodo" />
        </CardContent>
      </Card>
    );
  }

  const top3 = products.slice(0, 3);
  // El endpoint permite máximo 20 productos, así que "cada 20" equivale a
  // revelar el resto del ranking de una vez, detrás de un botón.
  const rest = products.slice(3, REVEAL_CHUNK);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-4" /> Top de productos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-3 items-end gap-2">
          {PODIUM.map((slot) => {
            const product = top3[slot.rank - 1];
            if (!product) return <div key={slot.rank} className={slot.visualOrder} />;
            return (
              <div
                key={slot.rank}
                className={cn("flex min-w-0 flex-col items-center gap-2", slot.visualOrder)}
              >
                <div className="flex min-w-0 flex-col items-center gap-1 text-center">
                  <span className="text-xl leading-none">{slot.medal}</span>
                  <p className="line-clamp-2 min-w-0 text-xs font-medium">
                    {product.nombre_producto}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatNumber(product.cantidad_vendida)} und.
                  </p>
                </div>
                <div
                  className={cn(
                    "flex w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-t-lg px-1",
                    slot.height,
                    slot.badge
                  )}
                >
                  <span className="text-base font-bold">{slot.rank}°</span>
                  <span className="truncate text-[10px] font-medium">
                    {formatMoney(product.total_vendido)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {rest.length > 0 && (
          <div className="flex flex-col gap-2">
            {showAll &&
              rest.map((p, i) => (
                <div
                  key={p.producto_id ?? i}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                      {i + 4}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.nombre_producto}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(p.cantidad_vendida)} und.
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-medium">
                    {formatMoney(p.total_vendido)}
                  </span>
                </div>
              ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAll((v) => !v)}
              className="self-start"
            >
              {showAll ? "Ver menos" : `Ver ranking completo (${rest.length} más)`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
