import { Suspense } from "react";
import { TrendingUp, CreditCard, Trophy, CalendarDays, Clock, Layers, Columns3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesAreaChart } from "@/components/dashboard/sales-area-chart";
import { HourlyBarChart } from "@/components/dashboard/hourly-bar-chart";
import { ChannelBarChart } from "@/components/dashboard/channel-bar-chart";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getReportsSales,
  getReportsPaymentMethods,
  getReportsTopProducts,
  getReportsHourlySales,
  getReportsProfit,
} from "@/lib/api/queries";
import {
  daysAgoISO,
  formatMoney,
  formatNumber,
  paymentMethodBadgeVariant,
  paymentMethodLabel,
  todayISO,
} from "@/lib/format";
import { parseDateOnly } from "@/lib/format";
import { resolveDateRange } from "@/lib/get-date-range";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function ReportesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { from, to } = await resolveDateRange(params, { from: daysAgoISO(7), to: todayISO() });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground">
            Ventas, medios de pago, productos top y rentabilidad.
          </p>
        </div>
        <DateRangeFilter defaultFrom={from} defaultTo={to} />
      </div>

      <Suspense key={`${from}-${to}`} fallback={<Skeleton className="h-96 rounded-xl" />}>
        <ReportesContent from={from} to={to} />
      </Suspense>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  tone = "primary",
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  tone?: "primary" | "accent" | "success" | "warning";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  }[tone];
  return (
    <div className="flex items-center gap-3">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="size-6" />
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

async function ReportesContent({ from, to }: { from: string; to: string }) {
  const [sales, paymentMethods, topProducts, hourly, profit] = await Promise.all([
    getReportsSales({ from, to }),
    getReportsPaymentMethods({ from, to }),
    getReportsTopProducts({ from, to, limit: 20 }),
    getReportsHourlySales({ from, to }),
    getReportsProfit({ from, to }),
  ]);

  const paymentTotal = paymentMethods.data.reduce((a, m) => a + m.net_total, 0);
  const top10 = topProducts.data.slice(0, 10);

  // Ticket promedio y mejor/peor día (solo días con ventas)
  const avgTicket = sales.summary.count > 0 ? sales.summary.total / sales.summary.count : 0;
  const daysWithSales = sales.data.filter((d) => d.total > 0);
  const bestDay = daysWithSales.length ? daysWithSales.reduce((a, b) => (b.total > a.total ? b : a)) : null;
  const worstDay = daysWithSales.length ? daysWithSales.reduce((a, b) => (b.total < a.total ? b : a)) : null;
  const dayLabel = (iso: string) =>
    new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(parseDateOnly(iso));

  // Ventas por categoría (agrupando el top de productos)
  const byCategory = Object.values(
    topProducts.data.reduce<Record<string, { categoria: string; total: number; qty: number }>>((acc, p) => {
      const key = p.categoria || "Sin categoría";
      acc[key] ??= { categoria: key, total: 0, qty: 0 };
      acc[key].total += p.total_vendido;
      acc[key].qty += p.cantidad_vendida;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);
  const categoryTotal = byCategory.reduce((a, c) => a + c.total, 0);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-3">
        <StatCard
          label="Utilidad bruta"
          value={formatMoney(profit.summary.gross_profit)}
          sub={`Margen bruto ${profit.summary.gross_margin_percent}%`}
          icon={TrendingUp}
          accent="primary"
          variant="solid"
          valueClassName="text-4xl"
        />
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Ingresos"
            value={formatMoney(profit.summary.revenue)}
            accent="success"
            variant="solid"
            size="compact"
            valueClassName="text-2xl"
          />
          <StatCard
            label="Costo"
            value={formatMoney(profit.summary.cost)}
            accent="warning"
            variant="solid"
            size="compact"
            valueClassName="text-2xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Ticket promedio" value={formatMoney(avgTicket)} accent="accent" variant="solid" size="compact" valueClassName="text-2xl" />
        <StatCard label="Ventas" value={formatNumber(sales.summary.count)} accent="primary" variant="solid" size="compact" valueClassName="text-2xl" />
        <StatCard
          label="Mejor día"
          value={bestDay ? formatMoney(bestDay.total) : "—"}
          sub={bestDay ? dayLabel(bestDay.date) : undefined}
          accent="success"
          variant="solid"
          size="compact"
          valueClassName="text-2xl"
        />
        <StatCard
          label="Día más bajo"
          value={worstDay ? formatMoney(worstDay.total) : "—"}
          sub={worstDay ? dayLabel(worstDay.date) : undefined}
          accent="destructive"
          variant="solid"
          size="compact"
          valueClassName="text-2xl"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="rounded-[20px] p-5 shadow-sm lg:col-span-3">
          <SectionHeader icon={CalendarDays} title="Ventas por día" subtitle="Evolución en el periodo" />
          <div className="mt-5">
            {sales.data.length ? (
              <SalesAreaChart data={sales.data} />
            ) : (
              <EmptyState icon={TrendingUp} title="Sin ventas en el periodo" />
            )}
          </div>
        </Card>
        <Card className="rounded-[20px] p-5 shadow-sm lg:col-span-2">
          <SectionHeader icon={Clock} title="Ventas por hora" subtitle="Horas de mayor venta" tone="accent" />
          <div className="mt-5">
            <HourlyBarChart data={hourly.data} />
          </div>
        </Card>
      </div>

      <Card className="rounded-[20px] p-5 shadow-sm">
        <SectionHeader icon={Columns3} title="POS vs. en línea" subtitle="Ventas por canal, día a día" tone="accent" />
        <div className="mt-5">
          {sales.data.length ? (
            <ChannelBarChart data={sales.data} />
          ) : (
            <EmptyState icon={Columns3} title="Sin ventas en el periodo" />
          )}
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[20px] p-0 shadow-sm">
        <div className="p-5 pb-4">
          <SectionHeader icon={Layers} title="Ventas por categoría" subtitle="Según el top 20 de productos" tone="primary" />
        </div>
        {byCategory.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState icon={Layers} title="Sin ventas en el periodo" />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border/50">
            {byCategory.map((c) => {
              const pct = categoryTotal > 0 ? Math.round((c.total / categoryTotal) * 100) : 0;
              return (
                <div key={c.categoria} className="flex min-w-0 flex-col gap-2 px-5 py-4">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <span className="min-w-0 truncate font-display text-base font-semibold text-foreground">
                      {c.categoria}{" "}
                      <span className="font-display text-sm font-medium text-muted-foreground">
                        ({formatNumber(c.qty)} und.)
                      </span>
                    </span>
                    <span className="shrink-0 font-display text-base font-bold text-foreground">
                      {formatMoney(c.total)}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-9 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-[20px] p-0 shadow-sm">
          <div className="p-5 pb-4">
            <SectionHeader
              icon={CreditCard}
              title="Medios de pago"
              subtitle="Distribución del ingreso neto"
              tone="success"
            />
          </div>
          {paymentMethods.data.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState icon={CreditCard} title="Sin transacciones en el periodo" />
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/50">
              {paymentMethods.data.map((m) => {
                const pct = paymentTotal > 0 ? Math.round((m.net_total / paymentTotal) * 100) : 0;
                return (
                  <div key={m.payment_method} className="flex min-w-0 flex-col gap-2 px-5 py-4">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Badge variant={paymentMethodBadgeVariant(m.payment_method)} className="text-[13px]">
                          {paymentMethodLabel(m.payment_method)}
                        </Badge>
                        <span className="truncate text-sm text-muted-foreground">
                          {formatNumber(m.transactions)} transacc.
                        </span>
                      </div>
                      <span className="shrink-0 font-display text-base font-bold text-foreground">
                        {formatMoney(m.net_total)}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-9 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden rounded-[20px] p-0 shadow-sm">
          <div className="p-5 pb-4">
            <SectionHeader
              icon={Trophy}
              title="Productos más vendidos"
              subtitle="Top 10 del periodo"
              tone="warning"
            />
          </div>
          {top10.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState icon={Trophy} title="Sin ventas de productos en el periodo" />
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/50">
              {top10.map((p, i) => (
                <div key={p.producto_id ?? i} className="flex min-w-0 items-center gap-3 px-5 py-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-semibold text-foreground">
                      {p.nombre_producto}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {formatNumber(p.cantidad_vendida)} und. · {p.porcentaje_participacion}%
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-base font-bold text-foreground">
                    {formatMoney(p.total_vendido)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
