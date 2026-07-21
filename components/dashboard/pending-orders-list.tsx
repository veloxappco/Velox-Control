"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadMoreButton } from "@/components/shared/load-more-button";
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
        <LoadMoreButton
          label={`Cargar ${Math.min(PAGE_SIZE, remaining)} más (${remaining} restantes)`}
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
        />
      )}

      <OrderDetailSheet order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
