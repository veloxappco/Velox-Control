"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Phone,
  Truck,
  CreditCard,
  Check,
  X,
  ShoppingBag,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import {
  deliveryTypeLabel,
  formatDateTime,
  formatMoney,
  orderStatusLabel,
  orderStatusVariant,
  paymentMethodLabel,
  type OrderStatusGroup,
} from "@/lib/format";
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
          {visible.map((order) => {
            const colors = orderStatusColors(order.status);
            const Icon = orderStatusIcon(order.status);
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelected(order)}
                className="flex min-w-0 items-center gap-3 rounded-[20px] border border-border/60 bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.985] active:shadow-sm sm:p-5"
              >
                <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", colors.soft)}>
                  <Icon className={cn("size-5", colors.text)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                    {order.order_number}
                  </p>
                  <p className="mt-0.5 truncate text-base font-medium text-foreground/70">
                    {order.customer_name ?? "Cliente sin nombre"}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
                    {formatMoney(order.total)}
                  </span>
                  <Badge variant={orderStatusVariant(order.status)} className="text-[13px]">
                    {orderStatusLabel(order.status)}
                  </Badge>
                </div>
              </button>
            );
          })}

          {hasMore && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="mt-1 self-center rounded-full"
            >
              <ChevronDown className="size-4" />
              Cargar {Math.min(PAGE_SIZE, remaining)} más ({remaining} restantes)
            </Button>
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
