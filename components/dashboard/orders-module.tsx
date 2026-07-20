"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ClipboardList, Phone, Truck, CreditCard, Check, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_GROUPS,
  deliveryTypeLabel,
  formatDateTime,
  formatMoney,
  orderStatusLabel,
  orderStatusVariant,
  paymentMethodLabel,
} from "@/lib/format";
import type { OrderListItem } from "@/lib/api/types";

const PAGE_SIZE = 10;
const FILTERS = ["Todas", ...ORDER_STATUS_GROUPS] as const;

export function OrdersModule({ orders }: { orders: OrderListItem[] }) {
  const [statusFilter, setStatusFilter] = useState<(typeof FILTERS)[number]>("Todas");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<OrderListItem | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    if (statusFilter === "Todas") return orders;
    return orders.filter((o) => orderStatusLabel(o.status) === statusFilter);
  }, [orders, statusFilter]);

  // Reinicia el contador de "revelados" cuando cambia el filtro, sin usar un
  // efecto: ajustar el estado durante el render evita el re-render en cascada
  // (patrón recomendado por React para "resetear estado ante un cambio").
  const [filterAtLastReset, setFilterAtLastReset] = useState(statusFilter);
  if (filterAtLastReset !== statusFilter) {
    setFilterAtLastReset(statusFilter);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Lazy load: revela 10 pedidos más cuando el "centinela" entra en pantalla,
  // en vez de renderizar los cientos de pedidos de una sola vez.
  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => c + PAGE_SIZE);
        }
      },
      { rootMargin: "250px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((label) => {
          const count =
            label === "Todas"
              ? orders.length
              : orders.filter((o) => orderStatusLabel(o.status) === label).length;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setStatusFilter(label)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === label
                  ? "border-transparent bg-gradient-brand text-white shadow"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
              )}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Sin pedidos en esta categoría" />
      ) : (
        <div className="flex min-w-0 flex-col gap-2">
          {visible.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelected(order)}
              className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-border bg-card p-3.5 text-left shadow-sm transition-colors hover:bg-secondary/30 active:bg-secondary/50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{order.order_number}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {order.customer_name ?? "Cliente sin nombre"}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {formatDateTime(order.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-sm font-semibold">{formatMoney(order.total)}</span>
                <Badge variant={orderStatusVariant(order.status)}>
                  {orderStatusLabel(order.status)}
                </Badge>
              </div>
            </button>
          ))}

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-2">
              <span className="text-xs text-muted-foreground">Cargando más pedidos…</span>
            </div>
          )}
        </div>
      )}

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          {selected && (
            <div className="flex min-w-0 flex-col gap-5 p-5 pt-8">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Pedido {selected.order_number}
                </p>
                <h3 className="truncate text-2xl font-semibold tracking-tight">
                  {selected.customer_name ?? "Cliente sin nombre"}
                </h3>
                <Badge variant={orderStatusVariant(selected.status)} className="mt-2">
                  {orderStatusLabel(selected.status)}
                </Badge>
              </div>

              <OrderTimeline order={selected} />

              <div className="flex flex-col gap-3 rounded-lg border border-border/60 p-4">
                {selected.customer_phone && (
                  <DetailRow icon={Phone} label="Teléfono" value={selected.customer_phone} />
                )}
                <DetailRow
                  icon={Truck}
                  label="Entrega"
                  value={deliveryTypeLabel(selected.delivery_type)}
                />
                <DetailRow
                  icon={CreditCard}
                  label="Pago"
                  value={selected.payment_method ? paymentMethodLabel(selected.payment_method) : "—"}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-4 py-3">
                <span className="text-sm text-muted-foreground">Total del pedido</span>
                <span className="text-lg font-semibold">{formatMoney(selected.total)}</span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function OrderTimeline({ order }: { order: OrderListItem }) {
  const isCancelled = orderStatusLabel(order.status) === "Cancelado";

  const steps = [
    { label: "Creado", at: order.created_at as string | null, cancelled: false },
    { label: "Confirmado", at: order.confirmed_at, cancelled: false },
    { label: isCancelled ? "Cancelado" : "Entregado", at: order.completed_at, cancelled: isCancelled },
  ];

  return (
    <div className="flex min-w-0 flex-col rounded-lg border border-border/60 p-4">
      {steps.map((step, index) => {
        const done = Boolean(step.at) && !step.cancelled;
        const isLast = index === steps.length - 1;
        return (
          <div key={step.label} className="flex min-w-0 gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                  step.cancelled
                    ? "border-destructive bg-destructive text-white"
                    : done
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-secondary text-muted-foreground"
                )}
              >
                {step.cancelled ? (
                  <X className="size-3" />
                ) : done ? (
                  <Check className="size-3" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              {!isLast && (
                <span
                  className={cn("my-0.5 w-px flex-1", done ? "bg-primary/40" : "bg-border")}
                />
              )}
            </div>
            <div className={cn("min-w-0", isLast ? "pb-0" : "pb-4")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  !done && !step.cancelled && "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {step.at ? formatDateTime(step.at) : step.cancelled ? "—" : "Pendiente"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
