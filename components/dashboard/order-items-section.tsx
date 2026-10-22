"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ItemRemovalList } from "@/components/dashboard/item-removal-list";
import { orderStatusLabel } from "@/lib/format";
import type { OrderDetail } from "@/lib/api/types";

// Productos de un pedido en línea (cargados bajo demanda) + eliminación.
export function OrderItemsSection({ orderId, status }: { orderId: number; status: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/orders/${orderId}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.message ?? "No se pudieron cargar los productos.");
        if (!cancelled) {
          setDetail(body.data as OrderDetail);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "No se pudieron cargar los productos.");
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, tick]);

  if (error && !detail) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[20px] border border-destructive/30 bg-destructive/5 p-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <button type="button" onClick={() => setTick((t) => t + 1)} className="font-display text-sm font-semibold text-primary">
          Reintentar
        </button>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando productos…
      </div>
    );
  }

  const cancelled = orderStatusLabel(detail.status || status) === "Cancelado";

  return (
    <ItemRemovalList
      kind="order"
      id={orderId}
      items={detail.items}
      locked={cancelled}
      voidedNote={cancelled ? "Pedido cancelado" : undefined}
      onChanged={() => {
        setTick((t) => t + 1);
        router.refresh();
      }}
    />
  );
}
