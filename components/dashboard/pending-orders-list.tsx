"use client";

import { useState } from "react";
import { ChevronDown, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderCard } from "@/components/dashboard/order-card";
import { OrderDetailSheet } from "@/components/dashboard/order-detail-sheet";
import type { OrderListItem } from "@/lib/api/types";

const PAGE_SIZE = 10;

// Mismo diseño de tarjeta que "Pedidos en línea" (Ingresos), con lazy load
// de 10 en 10 por si hay más de 10 pedidos sin entregar.
export function PendingOrdersList({ orders }: { orders: OrderListItem[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<OrderListItem | null>(null);

  if (orders.length === 0) {
    return <EmptyState icon={ClipboardList} title="No hay pedidos pendientes" />;
  }

  const visible = orders.slice(0, visibleCount);
  const hasMore = visibleCount < orders.length;
  const remaining = orders.length - visibleCount;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {visible.map((order) => (
        <OrderCard key={order.id} order={order} onClick={() => setSelected(order)} />
      ))}

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

      <OrderDetailSheet order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
