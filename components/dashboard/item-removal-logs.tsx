"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadMoreButton } from "@/components/shared/load-more-button";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import type { ItemRemovalLog } from "@/lib/api/types";

const PAGE_SIZE = 10;

function origin(log: ItemRemovalLog) {
  if (log.pos_table_order_id) return "Cuenta de mesa";
  if (log.pos_sale_id) return "Venta POS";
  if (log.order_id) return "Pedido en línea";
  return "Eliminación";
}

function refId(log: ItemRemovalLog) {
  return log.pos_table_order_id ?? log.pos_sale_id ?? log.order_id;
}

function removedAmount(log: ItemRemovalLog) {
  return Number(log.total_before) - Number(log.total_after);
}

// Historial de productos eliminados (quién, cuándo, cuánto y por qué).
export function ItemRemovalLogs({ logs, total }: { logs: ItemRemovalLog[]; total: number }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<ItemRemovalLog | null>(null);
  const remaining = logs.length - visibleCount;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center gap-2">
        <Trash2 className="size-[18px] shrink-0 text-destructive" />
        <h2 className="font-display text-md font-semibold text-foreground">Productos eliminados</h2>
        <span className="text-sm text-muted-foreground">({formatNumber(total)})</span>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={Trash2} title="Sin eliminaciones en el periodo" />
      ) : (
        <div className="flex min-w-0 flex-col gap-3">
          {logs.slice(0, visibleCount).map((log) => {
            const n = log.removed_items.reduce((a, i) => a + i.quantity, 0);
            return (
              <button
                key={log.id}
                type="button"
                onClick={() => setSelected(log)}
                className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card p-3.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.985] active:shadow-sm sm:p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 className="size-[18px] text-destructive" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-md font-semibold text-foreground">
                    {origin(log)} #{refId(log)}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-foreground/70">
                    {formatNumber(n)} producto{n === 1 ? "" : "s"} · {log.removed_by?.name ?? "—"}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {log.reason ? `${log.reason} · ` : ""}
                    {formatDateTime(log.created_at)}
                  </p>
                </div>
                <span className="shrink-0 font-display text-md font-semibold text-destructive">
                  -{formatMoney(removedAmount(log))}
                </span>
              </button>
            );
          })}
          {remaining > 0 && (
            <LoadMoreButton
              label={`Cargar ${Math.min(PAGE_SIZE, remaining)} más (${remaining} restantes)`}
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            />
          )}
        </div>
      )}

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          {selected && (
            <div className="flex min-w-0 flex-col gap-5 p-5 pt-8">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{formatDateTime(selected.created_at)}</p>
                <h3 className="truncate font-display text-xl font-semibold tracking-tight text-foreground">
                  {origin(selected)} #{refId(selected)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Eliminado por <span className="font-semibold text-foreground">{selected.removed_by?.name ?? "—"}</span>
                </p>
              </div>

              <div className="rounded-2xl bg-destructive px-4 py-4 text-white shadow-sm">
                <p className="text-sm text-white/80">Valor eliminado</p>
                <p className="font-display text-3xl font-bold">{formatMoney(removedAmount(selected))}</p>
                <p className="mt-1 text-sm text-white/85">
                  Total: {formatMoney(Number(selected.total_before))} → {formatMoney(Number(selected.total_after))}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">Motivo</p>
                <p className="mt-0.5 text-base font-semibold text-foreground">{selected.reason || "—"}</p>
              </div>

              <div className="flex flex-col divide-y divide-border/50 rounded-2xl border border-border/60 bg-card shadow-sm">
                {selected.removed_items.map((item, i) => (
                  <div key={`${item.id}-${i}`} className="flex min-w-0 items-center gap-3 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold text-foreground">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(item.quantity)} × {formatMoney(item.unit_price)}
                        {item.status_before && ` · estaba ${item.status_before === "served" ? "servido" : "enviado"}`}
                      </p>
                    </div>
                    <span className="shrink-0 font-display text-base font-bold text-foreground">
                      {formatMoney(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
