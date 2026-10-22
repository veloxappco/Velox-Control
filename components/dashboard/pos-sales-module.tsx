"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ItemRemovalList } from "@/components/dashboard/item-removal-list";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadMoreButton } from "@/components/shared/load-more-button";
import {
  formatDateTime,
  formatMoney,
  formatNumber,
  paymentMethodBadgeVariant,
  paymentMethodLabel,
  toTitleCase,
} from "@/lib/format";
import type { PosSaleDetail, PosSaleListItem } from "@/lib/api/types";

const PAGE_SIZE = 10;

function saleStatus(status: string): { label: string; variant: "success" | "destructive" | "secondary" } {
  if (status === "completed" || status === "paid") return { label: "Completada", variant: "success" };
  if (["cancelled", "canceled", "voided", "void", "refunded"].includes(status)) {
    return { label: "Anulada", variant: "destructive" };
  }
  return { label: toTitleCase(status), variant: "secondary" };
}

export function PosSalesModule({
  sales,
  total,
  embedded = false,
}: {
  sales: PosSaleListItem[];
  total: number;
  embedded?: boolean;
}) {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<PosSaleListItem | null>(null);
  const [detail, setDetail] = useState<PosSaleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadDetail(id: number) {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/pos-sales/${id}`, { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message ?? "No se pudo cargar la venta.");
      setDetail(body.data as PosSaleDetail);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "No se pudo cargar la venta.");
    } finally {
      setLoading(false);
    }
  }

  function openSale(sale: PosSaleListItem) {
    setSelected(sale);
    setDetail(null);
    void loadDetail(sale.id);
  }

  function close() {
    setSelected(null);
    setDetail(null);
    setLoadError(null);
  }

  const visible = sales.slice(0, visibleCount);
  const remaining = sales.length - visibleCount;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {!embedded && (
        <div className="flex items-center gap-2">
          <Store className="size-[18px] shrink-0 text-primary" />
          <h2 className="font-display text-md font-semibold text-foreground">Ventas POS</h2>
          <span className="text-sm text-muted-foreground">({formatNumber(total)})</span>
        </div>
      )}

      {sales.length === 0 ? (
        <EmptyState icon={Store} title="Sin ventas POS en el periodo" />
      ) : (
        <div className="flex min-w-0 flex-col gap-3">
          {visible.map((sale) => {
            const st = saleStatus(sale.status);
            return (
              <button
                key={sale.id}
                type="button"
                onClick={() => openSale(sale)}
                className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card p-3.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.985] active:shadow-sm sm:p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Store className="size-[18px] text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-md font-semibold text-foreground">
                    {sale.table ?? sale.customer_name ?? "Venta"}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-foreground/70">{sale.sale_number}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{formatDateTime(sale.sold_at)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-display text-md font-semibold text-foreground">
                    {formatMoney(sale.total)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {sale.payment_method && (
                      <Badge variant={paymentMethodBadgeVariant(sale.payment_method)} className="text-xs">
                        {paymentMethodLabel(sale.payment_method)}
                      </Badge>
                    )}
                    {st.variant !== "success" && (
                      <Badge variant={st.variant} className="text-xs">
                        {st.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {remaining > 0 && (
            <LoadMoreButton
              label={`Cargar ${Math.min(PAGE_SIZE, remaining)} más (${remaining} restantes)`}
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            />
          )}
          {total > sales.length && (
            <p className="text-center text-xs text-muted-foreground">
              Mostrando {formatNumber(sales.length)} de {formatNumber(total)} ventas del periodo.
            </p>
          )}
        </div>
      )}

      <Sheet open={selected !== null} onOpenChange={(open) => !open && close()}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          {selected && (
            <SaleDetail
              key={selected.id}
              base={selected}
              detail={detail}
              loading={loading}
              error={loadError}
              onRetry={() => void loadDetail(selected.id)}
              onChanged={async () => {
                await loadDetail(selected.id);
                router.refresh();
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SaleDetail({
  base,
  detail,
  loading,
  error,
  onRetry,
  onChanged,
}: {
  base: PosSaleListItem;
  detail: PosSaleDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onChanged: () => Promise<void>;
}) {
  const sale = detail ?? base;
  const st = saleStatus(sale.status);

  return (
    <div className="flex min-w-0 flex-col gap-5 p-5 pt-8">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Store className="size-[18px] text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Venta {sale.sale_number}</p>
            <h3 className="truncate font-display text-xl font-semibold tracking-tight text-foreground">
              {sale.table ?? sale.customer_name ?? "Venta POS"}
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={st.variant} className="text-xs">
            {st.label}
          </Badge>
          {sale.payment_method && (
            <Badge variant={paymentMethodBadgeVariant(sale.payment_method)} className="text-xs">
              {paymentMethodLabel(sale.payment_method)}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{formatDateTime(sale.sold_at)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3.5 shadow-sm">
        <span className="text-sm text-white/80">Total de la venta</span>
        <span className="font-display text-md font-bold text-white">{formatMoney(sale.total)}</span>
      </div>

      {loading && !detail && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando productos…
        </div>
      )}

      {error && !detail && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button type="button" onClick={onRetry} className="font-display text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      )}

      {detail && (
        <ItemRemovalList
          kind="pos-sale"
          id={sale.id}
          items={detail.items}
          locked
          lockedNote="Venta cobrada: solo consulta. Los productos solo se pueden eliminar mientras la cuenta está abierta."
          voidedNote="Esta venta no tiene productos"
          onChanged={onChanged}
        />
      )}
    </div>
  );
}
