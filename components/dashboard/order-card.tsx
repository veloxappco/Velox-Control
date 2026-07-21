import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDateTime, formatMoney, orderStatusLabel, orderStatusVariant } from "@/lib/format";
import { orderStatusColors, orderStatusIcon } from "@/lib/order-status";
import type { OrderListItem } from "@/lib/api/types";

// Tarjeta de pedido reutilizable — mismo diseño en "Pedidos en línea"
// (Ingresos) y "Pedidos pendientes" (Dashboard): icono circular con el color
// del estado, número de pedido y precio como cifras grandes, cliente y fecha
// en jerarquía secundaria, badge del estado a la derecha.
export function OrderCard({ order, onClick }: { order: OrderListItem; onClick?: () => void }) {
  const colors = orderStatusColors(order.status);
  const Icon = orderStatusIcon(order.status);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 items-center gap-3 rounded-[20px] border border-border/60 bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.985] active:shadow-sm sm:p-5"
    >
      <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", colors.soft)}>
        {/* orderStatusIcon() devuelve una referencia estable desde un Record
         * fijo (Clock/ChefHat/etc. son constantes de módulo) — no crea un
         * componente nuevo en cada render, pese a la advertencia genérica
         * del linter. */}
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon className={cn("size-5", colors.text)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          {order.order_number}
        </p>
        <p className="mt-0.5 truncate text-base font-medium text-foreground/70">
          {order.customer_name ?? "Cliente sin nombre"}
        </p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{formatDateTime(order.created_at)}</p>
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
}
