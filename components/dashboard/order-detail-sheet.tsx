"use client";

import { Phone, Truck, CreditCard, Check, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  deliveryTypeLabel,
  formatDateTime,
  formatMoney,
  orderStatusLabel,
  orderStatusVariant,
  paymentMethodLabel,
} from "@/lib/format";
import type { OrderListItem } from "@/lib/api/types";

// Hoja de detalle de un pedido — compartida entre "Pedidos en línea"
// (Ingresos) y "Pedidos pendientes" (Dashboard).
export function OrderDetailSheet({
  order,
  onClose,
}: {
  order: OrderListItem | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={order !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        {order && (
          <div className="flex min-w-0 flex-col gap-5 p-5 pt-8">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Pedido {order.order_number}</p>
              <h3 className="truncate text-2xl font-semibold tracking-tight">
                {order.customer_name ?? "Cliente sin nombre"}
              </h3>
              <Badge variant={orderStatusVariant(order.status)} className="mt-2">
                {orderStatusLabel(order.status)}
              </Badge>
            </div>

            <OrderTimeline order={order} />

            <div className="flex flex-col gap-3 rounded-lg border border-border/60 p-4">
              {order.customer_phone && (
                <DetailRow icon={Phone} label="Teléfono" value={order.customer_phone} />
              )}
              <DetailRow icon={Truck} label="Entrega" value={deliveryTypeLabel(order.delivery_type)} />
              <DetailRow
                icon={CreditCard}
                label="Pago"
                value={order.payment_method ? paymentMethodLabel(order.payment_method) : "—"}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">Total del pedido</span>
              <span className="text-lg font-semibold">{formatMoney(order.total)}</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
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
              {!isLast && <span className={cn("my-0.5 w-px flex-1", done ? "bg-primary/40" : "bg-border")} />}
            </div>
            <div className={cn("min-w-0", isLast ? "pb-0" : "pb-4")}>
              <p className={cn("text-sm font-medium", !done && !step.cancelled && "text-muted-foreground")}>
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
