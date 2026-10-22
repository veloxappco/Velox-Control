"use client";

import { useState } from "react";
import { AlertTriangle, Check, Loader2, Store, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { formatMoney, formatNumber } from "@/lib/format";

export interface RemovableItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  /** Opcionales (cuentas abiertas del POS) */
  status_group?: string;
  options_summary?: string;
  notes?: string | null;
}

// Lista de productos con casillas + motivo + confirmación para que el
// administrador elimine productos de un pedido o de una venta POS.
// Compartida por "Ventas POS" y por el detalle de pedidos en línea.
export function ItemRemovalList({
  kind,
  id,
  items,
  locked,
  warning,
  voidedNote,
  lockedNote,
  onChanged,
}: {
  kind: "pos-sale" | "order" | "pos-account";
  id: number;
  items: RemovableItem[];
  /** Pedido/venta ya anulado: se muestran los productos pero no se editan. */
  locked: boolean;
  warning?: string;
  voidedNote?: string;
  /** Aviso cuando está bloqueado (p. ej. "Venta cobrada: solo consulta"). */
  lockedNote?: string;
  onChanged: () => Promise<void> | void;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Los productos ya servidos no se pueden eliminar (ya salieron al cliente).
  const selectable = items.filter((i) => i.status_group !== "served");
  const allSelected = selectable.length > 0 && checked.size === selectable.length;
  // Solo se anula la cuenta completa si se quitan TODOS sus productos.
  const wholeAccount = items.length > 0 && checked.size === items.length;
  const selectedTotal = items.filter((i) => checked.has(i.id)).reduce((a, i) => a + i.total, 0);

  function toggle(itemId: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
    setConfirming(false);
    setMessage(null);
  }

  function toggleAll() {
    setChecked(allSelected ? new Set() : new Set(selectable.map((i) => i.id)));
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
        body: JSON.stringify({ kind, id, item_ids: Array.from(checked), all: allSelected, reason }),
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
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-md font-semibold text-foreground">Productos</h4>
        {selectable.length > 0 && !locked && (
          <button type="button" onClick={toggleAll} className="font-display text-sm font-semibold text-primary active:scale-95">
            {allSelected ? "Quitar selección" : "Seleccionar todos"}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Store} title={voidedNote ?? "Sin productos"} />
      ) : (
        <div className="flex flex-col divide-y divide-border/50 rounded-[20px] border border-border/60 bg-card shadow-sm">
          {items.map((item) => {
            const on = checked.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                disabled={locked || submitting || item.status_group === "served"}
                onClick={() => toggle(item.id)}
                className="flex min-w-0 items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-secondary/50 disabled:opacity-70"
              >
                {!locked && item.status_group !== "served" && (
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      on ? "border-destructive bg-destructive text-white" : "border-border bg-card"
                    )}
                  >
                    {on && <Check className="size-3.5" />}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-semibold text-foreground">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(item.quantity)} × {formatMoney(item.unit_price)}
                  </p>
                  {item.options_summary && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.options_summary}</p>
                  )}
                  {item.notes && !item.notes.startsWith("Variaciones:") && (
                    <p className="mt-0.5 text-xs italic text-muted-foreground">{item.notes}</p>
                  )}
                  {item.status_group && (
                    <span
                      className={cn(
                        "mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                        item.status_group === "served" ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
                      )}
                    >
                      {item.status_group === "served" ? "Servido" : "Enviado"}
                    </span>
                  )}
                </div>
                <span className="shrink-0 font-display text-base font-bold text-foreground">{formatMoney(item.total)}</span>
              </button>
            );
          })}
        </div>
      )}

      {locked && lockedNote && (
        <div className="rounded-2xl bg-secondary/70 p-3 text-sm text-muted-foreground">{lockedNote}</div>
      )}

      {!locked && items.length > 0 && selectable.length < items.length && (
        <p className="text-xs text-muted-foreground">Los productos servidos no se pueden eliminar.</p>
      )}

      {warning && !locked && (
        <div className="flex items-start gap-2 rounded-2xl bg-warning/10 p-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>{warning}</p>
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

      {!locked && items.length > 0 && checked.size > 0 && (
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
              {wholeAccount
                ? "Eliminar todos los productos"
                : `Eliminar ${checked.size} producto${checked.size === 1 ? "" : "s"}`}
            </button>
          ) : (
            <div className="flex flex-col gap-2.5 rounded-2xl bg-destructive/5 p-3">
              <p className="text-sm text-foreground">
                {wholeAccount
                  ? `Se eliminarán todos los productos (${formatMoney(selectedTotal)}) y ${
                      kind === "order" ? "el pedido" : kind === "pos-account" ? "la cuenta" : "la venta"
                    } quedará anulado/a.`
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
    </div>
  );
}
