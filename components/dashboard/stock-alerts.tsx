import { AlertTriangle, CheckCircle2, Package, PackageSearch, Wheat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import type { InventoryAlertItem } from "@/lib/api/types";

// Alertas de inventario: cada fila muestra el nivel de stock contra su mínimo
// con una barra, y el estado (agotado / bajo) en color.
export function StockAlerts({ items }: { items: InventoryAlertItem[] }) {
  const critical = items.filter((i) => i.is_negative || i.stock <= 0).length;
  const low = items.length - critical;

  return (
    <Card className="overflow-hidden rounded-2xl p-0 shadow-sm">
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
          <PackageSearch className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-md font-semibold text-foreground">Stock bajo</h3>
          <p className="text-sm text-muted-foreground">Productos e insumos por reponer</p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="flex gap-2 px-4 pb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
            <span className="size-1.5 rounded-full bg-destructive" /> {critical} agotado{critical === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
            <span className="size-1.5 rounded-full bg-warning" /> {low} bajo{low === 1 ? "" : "s"}
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 pb-8 pt-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="text-sm font-medium text-foreground">Inventario en buen estado</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border/50 border-t border-border/50">
          {items.map((item) => {
            const isCritical = item.is_negative || item.stock <= 0;
            const ratio = item.min_stock > 0 ? Math.max(0, Math.min(1, item.stock / item.min_stock)) : 0;
            const Icon = item.type === "product" ? Package : Wheat;
            return (
              <div key={`${item.type}-${item.id}`} className="flex min-w-0 items-center gap-3 px-4 py-3.5">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    isCritical ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                  )}
                >
                  {isCritical ? <AlertTriangle className="size-[18px]" /> : <Icon className="size-[18px]" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate font-display text-base font-semibold text-foreground">{item.name}</p>
                    <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {item.type === "product" ? "Producto" : "Insumo"}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full", isCritical ? "bg-destructive" : "bg-warning")}
                      style={{ width: `${Math.max(ratio * 100, isCritical ? 4 : 0)}%` }}
                    />
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className={cn(
                      "font-display text-base font-bold leading-tight",
                      isCritical ? "text-destructive" : "text-warning"
                    )}
                  >
                    {formatNumber(item.stock)}
                  </p>
                  <p className="text-xs text-muted-foreground">mín. {formatNumber(item.min_stock)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
