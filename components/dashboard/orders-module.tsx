"use client";

import { useMemo, useState } from "react";
import { ShoppingBag, SlidersHorizontal, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadMoreButton } from "@/components/shared/load-more-button";
import { OrderCard } from "@/components/dashboard/order-card";
import { OrderDetailSheet } from "@/components/dashboard/order-detail-sheet";
import { cn } from "@/lib/utils";
import { deliveryTypeLabel, orderStatusLabel, paymentMethodLabel, type OrderStatusGroup } from "@/lib/format";
import { orderStatusColors, orderStatusIcon } from "@/lib/order-status";
import type { OrderListItem } from "@/lib/api/types";

const PAGE_SIZE = 10;

const STATUS_CHIPS: Array<{ key: "Todos" | OrderStatusGroup; label: string }> = [
  { key: "Todos", label: "Todos" },
  { key: "Pendiente", label: "Pendientes" },
  { key: "En Preparación", label: "En preparación" },
  { key: "Listo", label: "Listos" },
  { key: "Entregado", label: "Entregados" },
  { key: "Cancelado", label: "Cancelados" },
];

export function OrdersModule({ orders }: { orders: OrderListItem[] }) {
  const [statusFilter, setStatusFilter] = useState<"Todos" | OrderStatusGroup>("Todos");
  const [deliveryFilter, setDeliveryFilter] = useState("Todos");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<OrderListItem | null>(null);

  const deliveryOptions = useMemo(
    () => Array.from(new Set(orders.map((o) => o.delivery_type).filter((v): v is string => Boolean(v)))),
    [orders]
  );
  const paymentOptions = useMemo(
    () => Array.from(new Set(orders.map((o) => o.payment_method).filter((v): v is string => Boolean(v)))),
    [orders]
  );
  const hasExtraFilters = deliveryFilter !== "Todos" || paymentFilter !== "Todos";

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "Todos" && orderStatusLabel(o.status) !== statusFilter) return false;
      if (deliveryFilter !== "Todos" && o.delivery_type !== deliveryFilter) return false;
      if (paymentFilter !== "Todos" && o.payment_method !== paymentFilter) return false;
      return true;
    });
  }, [orders, statusFilter, deliveryFilter, paymentFilter]);

  // Reinicia el contador de "revelados" cuando cambian los filtros, sin usar
  // un efecto: ajustar el estado durante el render evita el re-render en
  // cascada (patrón recomendado por React para "resetear estado ante un
  // cambio").
  const filterKey = `${statusFilter}|${deliveryFilter}|${paymentFilter}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remaining = filtered.length - visibleCount;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-5 shrink-0 text-primary" />
          <h2 className="font-display text-base font-bold text-foreground">Pedidos en línea</h2>
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-label="Abrir filtros"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all duration-200 hover:bg-secondary/50 hover:text-foreground active:scale-95"
        >
          <SlidersHorizontal className="size-4.5" />
          {hasExtraFilters && (
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_CHIPS.map(({ key, label }) => {
          const count =
            key === "Todos"
              ? orders.length
              : orders.filter((o) => orderStatusLabel(o.status) === key).length;
          const active = statusFilter === key;
          const colors =
            key === "Todos"
              ? { text: "text-primary", solid: "bg-primary" }
              : orderStatusColors(key);
          const Icon = key === "Todos" ? LayoutGrid : orderStatusIcon(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 font-display text-xs font-semibold transition-all duration-200",
                active
                  ? cn("border-transparent text-white shadow-md", colors.solid)
                  : "border-border bg-card text-foreground/70 hover:bg-secondary/40"
              )}
            >
              <Icon className={cn("size-3.5 shrink-0", active ? "text-white" : colors.text)} />
              {label}
              <span className={active ? "text-white/80" : "text-muted-foreground"}>({count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Sin pedidos en esta categoría" />
      ) : (
        <div className="flex min-w-0 flex-col gap-3">
          {visible.map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => setSelected(order)} />
          ))}

          {hasMore && (
            <LoadMoreButton
              label={`Cargar ${Math.min(PAGE_SIZE, remaining)} más (${remaining} restantes)`}
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            />
          )}
        </div>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
          <div className="flex min-w-0 flex-col gap-5 p-5 pt-8">
            <h3 className="font-display text-lg font-bold text-foreground">Filtros</h3>

            {deliveryOptions.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tipo de entrega
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Todos"
                    active={deliveryFilter === "Todos"}
                    onClick={() => setDeliveryFilter("Todos")}
                  />
                  {deliveryOptions.map((type) => (
                    <FilterChip
                      key={type}
                      label={deliveryTypeLabel(type)}
                      active={deliveryFilter === type}
                      onClick={() => setDeliveryFilter(type)}
                    />
                  ))}
                </div>
              </div>
            )}

            {paymentOptions.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Método de pago
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Todos"
                    active={paymentFilter === "Todos"}
                    onClick={() => setPaymentFilter("Todos")}
                  />
                  {paymentOptions.map((method) => (
                    <FilterChip
                      key={method}
                      label={paymentMethodLabel(method)}
                      active={paymentFilter === method}
                      onClick={() => setPaymentFilter(method)}
                    />
                  ))}
                </div>
              </div>
            )}

            <Button type="button" onClick={() => setFiltersOpen(false)} className="mt-2 rounded-full">
              Ver resultados
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <OrderDetailSheet order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200",
        active
          ? "border-transparent bg-primary text-white"
          : "border-border bg-card text-foreground/70 hover:bg-secondary/40"
      )}
    >
      {label}
    </button>
  );
}
