"use client";

import { Phone, Truck, CreditCard, Clock, ChefHat, X } from "lucide-react";
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
import { orderStatusColors, orderStatusIcon } from "@/lib/order-status";
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
        {order && <OrderDetailContent order={order} />}
      </SheetContent>
    </Sheet>
  );
}

function OrderDetailContent({ order }: { order: OrderListItem }) {
  const colors = orderStatusColors(order.status);
  const Icon = orderStatusIcon(order.status);

  return (
    <div className="flex min-w-0 flex-col gap-5 p-5 pt-8">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", colors.soft)}>
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Icon className={cn("size-5", colors.text)} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Pedido {order.order_number}</p>
            <h3 className="truncate font-display text-2xl font-extrabold tracking-tight text-foreground">
              {order.customer_name ?? "Cliente sin nombre"}
            </h3>
          </div>
        </div>
        <Badge variant={orderStatusVariant(order.status)} className="w-fit text-[13px]">
          {orderStatusLabel(order.status)}
        </Badge>
      </div>

      <OrderTimeline order={order} />

      <div className="flex flex-col gap-3 rounded-[20px] border border-border/60 p-4 shadow-sm">
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

      <div className="flex items-center justify-between rounded-[20px] bg-secondary/40 px-4 py-3.5">
        <span className="text-sm text-muted-foreground">Total del pedido</span>
        <span className="font-display text-lg font-extrabold text-foreground">{formatMoney(order.total)}</span>
      </div>
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

// Un color/icono distinto por paso — reutiliza el mismo lenguaje visual que
// el resto de la app (Clock=azul para "Creado/pendiente", ChefHat=naranja
// para "Confirmado", y el color/icono real del estado final del pedido para
// el último paso).
const TIMELINE_STEP_STYLES = {
  creado: { icon: Clock, solid: "bg-accent" },
  confirmado: { icon: ChefHat, solid: "bg-warning" },
} as const;

function OrderTimeline({ order }: { order: OrderListItem }) {
  const isCancelled = orderStatusLabel(order.status) === "Cancelado";
  const finalColors = orderStatusColors(order.status);
  const FinalIcon = orderStatusIcon(order.status);

  const steps = [
    {
      label: "Creado",
      at: order.created_at as string | null,
      cancelled: false,
      icon: TIMELINE_STEP_STYLES.creado.icon,
      solid: TIMELINE_STEP_STYLES.creado.solid,
    },
    {
      label: "Confirmado",
      at: order.confirmed_at,
      cancelled: false,
      icon: TIMELINE_STEP_STYLES.confirmado.icon,
      solid: TIMELINE_STEP_STYLES.confirmado.solid,
    },
    {
      label: isCancelled ? "Cancelado" : "Entregado",
      at: order.completed_at,
      cancelled: isCancelled,
      icon: isCancelled ? X : FinalIcon,
      solid: finalColors.solid,
    },
  ];

  return (
    <div className="flex min-w-0 flex-col rounded-[20px] border border-border/60 p-4 shadow-sm">
      {steps.map((step, index) => {
        const done = Boolean(step.at) && !step.cancelled;
        const isLast = index === steps.length - 1;
        const StepIcon = step.cancelled ? X : step.icon;
        return (
          <div key={step.label} className="flex min-w-0 gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  step.cancelled || done ? cn(step.solid, "text-white shadow-sm") : "bg-secondary text-muted-foreground"
                )}
              >
                {step.cancelled || done ? (
                  <StepIcon className="size-3.5" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              {!isLast && <span className="my-0.5 w-px flex-1 bg-border" />}
            </div>
            <div className={cn("min-w-0", isLast ? "pb-0" : "pb-4")}>
              <p className={cn("text-sm font-semibold", !done && !step.cancelled && "text-muted-foreground")}>
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
