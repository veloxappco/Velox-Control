"use client";

import { useState } from "react";
import { BarChart3, Loader2, Receipt, Store, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { ChannelBarChart } from "@/components/dashboard/channel-bar-chart";
import {
  formatMoney,
  formatNumber,
  paymentMethodBadgeVariant,
  paymentMethodLabel,
  parseDateOnly,
} from "@/lib/format";
import type {
  HourlySalesItem,
  PaymentMethodReport,
  SalesSeriesDay,
  TopProductItem,
} from "@/lib/api/types";

interface DayDetail {
  payments: PaymentMethodReport[];
  products: TopProductItem[];
  hours: HourlySalesItem[];
}

function dayTitle(iso: string) {
  const text = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(
    parseDateOnly(iso)
  );
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "Ventas por día": barras apiladas POS + en línea. Al tocar un día se abre
// un modal con el resumen y el detalle de esa fecha.
export function SalesByDayCard({ data }: { data: SalesSeriesDay[] }) {
  const [day, setDay] = useState<SalesSeriesDay | null>(null);
  const [detail, setDetail] = useState<DayDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function open(d: SalesSeriesDay) {
    setDay(d);
    setDetail(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/day-summary?date=${d.date}`, { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message ?? "No se pudo cargar el detalle.");
      setDetail(body as DayDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el detalle.");
    } finally {
      setLoading(false);
    }
  }

  const count = day ? day.pos_count + day.online_count : 0;
  const paymentTotal = detail?.payments.reduce((a, m) => a + m.net_total, 0) ?? 0;
  const peak = detail?.hours.length
    ? detail.hours.reduce((a, b) => (b.total > a.total ? b : a))
    : null;

  return (
    <Card className="rounded-2xl p-4 shadow-sm lg:col-span-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <BarChart3 className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-md font-semibold text-foreground">Ventas por día</h3>
          <p className="text-sm text-muted-foreground">POS y pedidos · toca una barra para ver el día</p>
        </div>
      </div>

      <div className="mt-4">
        {data.length ? (
          <ChannelBarChart data={data} onDayClick={open} />
        ) : (
          <EmptyState icon={BarChart3} title="Sin ventas en este periodo" />
        )}
      </div>

      <Sheet open={day !== null} onOpenChange={(o) => !o && setDay(null)}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          {day && (
            <div className="flex min-w-0 flex-col gap-5 p-5 pt-8">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Resumen del día</p>
                <h3 className="truncate font-display text-xl font-semibold tracking-tight text-foreground">
                  {dayTitle(day.date)}
                </h3>
              </div>

              <div className="rounded-2xl bg-primary px-4 py-4 text-white shadow-sm">
                <p className="text-sm text-white/80">Venta total</p>
                <p className="truncate font-display text-3xl font-bold">{formatMoney(day.total)}</p>
                <p className="mt-1 text-sm text-white/85">
                  {formatNumber(count)} venta{count === 1 ? "" : "s"}
                  {count > 0 && ` · ticket ${formatMoney(day.total / count)}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0 rounded-2xl bg-accent px-4 py-3.5 text-white shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-white/85">
                    <Store className="size-3.5" /> Ventas POS
                  </p>
                  <p className="mt-1 truncate font-display text-lg font-bold">{formatMoney(day.pos_total)}</p>
                  <p className="text-xs text-white/80">{formatNumber(day.pos_count)} ventas</p>
                </div>
                <div className="min-w-0 rounded-2xl bg-success px-4 py-3.5 text-white shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-white/85">
                    <ShoppingBag className="size-3.5" /> Pedidos
                  </p>
                  <p className="mt-1 truncate font-display text-lg font-bold">{formatMoney(day.online_total)}</p>
                  <p className="text-xs text-white/80">{formatNumber(day.online_count)} pedidos</p>
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Cargando detalle…
                </div>
              )}
              {error && <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

              {detail && (
                <>
                  {peak && peak.total > 0 && (
                    <div className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3">
                      <span className="text-sm text-muted-foreground">Hora de mayor venta</span>
                      <span className="font-display text-base font-semibold text-foreground">
                        {peak.label} · {formatMoney(peak.total)}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <h4 className="font-display text-md font-semibold text-foreground">Medios de pago</h4>
                    {detail.payments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sin transacciones.</p>
                    ) : (
                      <div className="flex flex-col divide-y divide-border/50 rounded-2xl border border-border/60 bg-card">
                        {detail.payments.map((m) => {
                          const pct = paymentTotal > 0 ? Math.round((m.net_total / paymentTotal) * 100) : 0;
                          return (
                            <div key={m.payment_method} className="flex min-w-0 flex-col gap-1.5 px-4 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2">
                                  <Badge variant={paymentMethodBadgeVariant(m.payment_method)} className="text-xs">
                                    {paymentMethodLabel(m.payment_method)}
                                  </Badge>
                                  <span className="truncate text-xs text-muted-foreground">
                                    {formatNumber(m.transactions)} transacc.
                                  </span>
                                </div>
                                <span className="shrink-0 font-display text-base font-bold text-foreground">
                                  {formatMoney(m.net_total)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{pct}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="font-display text-md font-semibold text-foreground">Productos más vendidos</h4>
                    {detail.products.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sin productos vendidos.</p>
                    ) : (
                      <div className="flex flex-col divide-y divide-border/50 rounded-2xl border border-border/60 bg-card">
                        {detail.products.map((p, i) => (
                          <div key={p.producto_id ?? i} className="flex min-w-0 items-center gap-3 px-4 py-3">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-display text-base font-semibold text-foreground">
                                {p.nombre_producto}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatNumber(p.cantidad_vendida)} und.</p>
                            </div>
                            <span className="shrink-0 font-display text-base font-bold text-foreground">
                              {formatMoney(p.total_vendido)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {!loading && !detail && !error && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Receipt className="size-4" /> Sin detalle disponible.
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
