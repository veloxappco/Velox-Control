"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Armchair, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { ItemRemovalList } from "@/components/dashboard/item-removal-list";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import type { PosAccount } from "@/lib/api/types";

function accountTitle(a: PosAccount) {
  if (a.table) return a.table;
  return a.type === "takeaway" ? "Para llevar" : "Cuenta";
}

// Cuentas abiertas del POS (mesas y para llevar): el administrador puede
// quitar productos cuando el cajero se lo pide (teléfono / WhatsApp). El POS
// ve el cambio al actualizar, porque la eliminación se hace en el backend.
export function PosAccountsModule({ accounts, embedded = false }: { accounts: PosAccount[]; embedded?: boolean }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Solo cuentas activas: las ya cerradas (status "paid") no se editan.
  const active = accounts.filter((a) => a.status !== "paid");
  // La cuenta abierta se lee de las props, así tras un refresh se actualiza sola.
  const selected = active.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {!embedded && (
        <div className="flex items-center gap-2">
          <Armchair className="size-[18px] shrink-0 text-primary" />
          <h2 className="font-display text-md font-semibold text-foreground">Mesas abiertas</h2>
          <span className="text-sm text-muted-foreground">({formatNumber(active.length)})</span>
        </div>
      )}

      {active.length === 0 ? (
        <EmptyState icon={Armchair} title="No hay cuentas abiertas" />
      ) : (
        <div className="flex min-w-0 flex-col gap-3">
          {active.map((a) => {
            const Icon = a.table ? Armchair : ShoppingBag;
            const pending = a.items.filter((i) => i.status_group !== "served").length;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedId(a.id)}
                className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card p-3.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.985] active:shadow-sm sm:p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
                  <Icon className="size-[18px] text-warning" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-md font-semibold text-foreground">
                    {accountTitle(a)}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-foreground/70">
                    {formatNumber(a.items.length)} producto{a.items.length === 1 ? "" : "s"}
                    {pending > 0 && ` · ${pending} sin servir`}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{formatDateTime(a.opened_at)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-display text-md font-semibold text-foreground">
                    {formatMoney(a.total)}
                  </span>
                  <Badge variant={a.payment_status === "paid" ? "success" : "warning"} className="text-xs">
                    {a.payment_status === "paid" ? "Pagada" : "Sin pagar"}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          {selected && (
            <div className="flex min-w-0 flex-col gap-5 p-5 pt-8">
              <div className="flex min-w-0 flex-col gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Cuenta {selected.number}</p>
                  <h3 className="truncate font-display text-xl font-semibold tracking-tight text-foreground">
                    {accountTitle(selected)}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={selected.payment_status === "paid" ? "success" : "warning"} className="text-xs">
                    {selected.payment_status === "paid" ? "Pagada" : "Sin pagar"}
                  </Badge>
                  {selected.cashier && <span className="text-xs text-muted-foreground">Cajero: {selected.cashier}</span>}
                  <span className="text-xs text-muted-foreground">{formatDateTime(selected.opened_at)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3.5 shadow-sm">
                <span className="text-sm text-white/80">Total de la cuenta</span>
                <span className="font-display text-md font-bold text-white">{formatMoney(selected.total)}</span>
              </div>

              <ItemRemovalList
                key={selected.id}
                kind="pos-account"
                id={selected.id}
                items={selected.items}
                locked={false}
                voidedNote="Esta cuenta no tiene productos"
                warning={
                  selected.payment_status === "paid"
                    ? "Esta cuenta ya está pagada. El sistema puede rechazar la eliminación o ajustar la caja."
                    : undefined
                }
                onChanged={() => router.refresh()}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
