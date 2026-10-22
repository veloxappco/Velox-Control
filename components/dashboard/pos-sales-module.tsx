"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2, Store, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadMoreButton } from "@/components/shared/load-more-button";
import { cn } from "@/lib/utils";
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

export function PosSalesModule({ sales, total }: { sales: PosSaleListItem[]; total: number }) {
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
      <div className="flex items-center gap-2">
        <Store className="size-5 shrink-0 text-primary" />
        <h2 className="font-display text-base font-bold text-foreground">Ventas POS</h2>
        <span className="text-sm text-muted-foreground">({formatNumber(total)})</span>
      </div>

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
                className="flex min-w-0 items-center gap-3 rounded-[20px] border border-border/60 bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.985] active:shadow-sm sm:p-5"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Store className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xl font-extrabold tracking-tight text-foreground">
                    {sale.table ?? sale.customer_name ?? "Venta"}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-foreground/70">{sale.sale_number}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{formatDateTime(sale.sold_at)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
                    {formatMoney(sale.total)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {sale.payment_method && (
                      <Badge variant={paymentMethodBadgeVariant(sale.payment_method)} className="text-[12px]">
                        {paymentMethodLabel(sale.payment_method)}
                      </Badge>
                    )}
                    {st.variant !== "success" && (
                      <Badge variant={st.variant} className="text-[12px]">
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
  const items = detail?.items ?? [];
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const allSelected = items.length > 0 && checked.size === items.length;
  const selectedItems = items.filter((i) => checked.has(i.id));
  const selectedTotal = selectedItems.reduce((a, i) => a + i.total, 0);
  const closed = sale.cash_session_status === "closed";
  const voided = st.variant === "destructive";

  function toggle(id: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setConfirming(false);
    setMessage(null);
  }

  function toggleAll() {
    setChecked(allSelected ? new Set() : new Set(items.map((i) => i.id)));
    setConfirming(false);
    setMessage(null);
  }

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/items/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "pos-sale",
          id: sale.id,
          item_ids: Array.from(checked),
          all: allSelected,
          reason,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? "No se pudo eliminar.");
      setChecked(new Set());
      setReason("");
      setConfirming(false);
      setMessage({ kind: "ok", text: body?.message ?? "Productos eliminados." });
      await onChanged();
    } catch (e) {
      setConfirming(false);
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "No se pudo eliminar." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 p-5 pt-8">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Store className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Venta {sale.sale_number}</p>
            <h3 className="truncate font-display text-2xl font-extrabold tracking-tight text-foreground">
              {sale.table ?? sale.customer_name ?? "Venta POS"}
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={st.variant} className="text-[13px]">
            {st.label}
          </Badge>
          {sale.payment_method && (
            <Badge variant={paymentMethodBadgeVariant(sale.payment_method)} className="text-[13px]">
              {paymentMethodLabel(sale.payment_method)}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{formatDateTime(sale.sold_at)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[20px] bg-primary px-4 py-3.5 shadow-sm">
        <span className="text-sm text-white/80">Total de la venta</span>
        <span className="font-display text-lg font-extrabold text-white">{formatMoney(sale.total)}</span>
      </div>

      {loading && !detail && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando productos…
        </div>
      )}

      {error && !detail && (
        <div className="flex flex-col items-center gap-2 rounded-[20px] border border-destructive/30 bg-destructive/5 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button type="button" onClick={onRetry} className="font-display text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      )}

      {detail && (
        <>
          <div className="flex items-center justify-between">
            <h4 className="font-display text-base font-bold text-foreground">Productos</h4>
            {items.length > 0 && !voided && (
              <button
                type="button"
                onClick={toggleAll}
                className="font-display text-sm font-semibold text-primary active:scale-95"
              >
                {allSelected ? "Quitar selección" : "Seleccionar todos"}
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <EmptyState icon={Store} title="Esta venta no tiene productos" />
          ) : (
            <div className="flex flex-col divide-y divide-border/50 rounded-[20px] border border-border/60 bg-card shadow-sm">
              {items.map((item) => {
                const on = checked.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={voided || submitting}
                    onClick={() => toggle(item.id)}
                    className="flex min-w-0 items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-secondary/50 disabled:opacity-60"
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        on ? "border-destructive bg-destructive text-white" : "border-border bg-card"
                      )}
                    >
                      {on && <Check className="size-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold text-foreground">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(item.quantity)} × {formatMoney(item.unit_price)}
                      </p>
                    </div>
                    <span className="shrink-0 font-display text-base font-bold text-foreground">
                      {formatMoney(item.total)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {closed && (
            <div className="flex items-start gap-2 rounded-2xl bg-warning/10 p-3 text-sm text-warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>La caja de esta venta ya está cerrada. El sistema puede rechazar la eliminación.</p>
            </div>
          )}

          {message && (
            <div
              className={cn(
                "rounded-2xl p-3 text-sm",
                message.kind === "ok" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}
            >
              {message.text}
            </div>
          )}

          {!voided && items.length > 0 && checked.size > 0 && (
            <div className="flex flex-col gap-3 rounded-[20px] border border-border/60 p-4 shadow-sm">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Motivo (obligatorio)</span>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setConfirming(false);
                  }}
                  rows={2}
                  maxLength={250}
                  placeholder="Ej: producto registrado por error"
                  className="w-full resize-none rounded-2xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>

              {!confirming ? (
                <button
                  type="button"
                  disabled={!reason.trim() || submitting}
                  onClick={() => setConfirming(true)}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-destructive font-display text-sm font-bold text-white shadow-md shadow-destructive/25 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                  {allSelected
                    ? "Eliminar todos los productos"
                    : `Eliminar ${checked.size} producto${checked.size === 1 ? "" : "s"}`}
                </button>
              ) : (
                <div className="flex flex-col gap-2.5 rounded-2xl bg-destructive/5 p-3">
                  <p className="text-sm text-foreground">
                    {allSelected
                      ? `Se eliminarán todos los productos (${formatMoney(selectedTotal)}) y la venta quedará anulada.`
                      : `Se eliminarán ${checked.size} producto${checked.size === 1 ? "" : "s"} por ${formatMoney(selectedTotal)}.`}{" "}
                    Esta acción queda registrada.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setConfirming(false)}
                      className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-card font-display text-sm font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => void submit()}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-destructive font-display text-sm font-bold text-white disabled:opacity-60"
                    >
                      {submitting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
