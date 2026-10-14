import { Suspense } from "react";
import { CreditCard, Clock, Layers, Columns3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportKpiCarousel, type ReportKpis } from "@/components/dashboard/report-kpi-carousel";
import { CategoryReportList, type CategoryRow } from "@/components/dashboard/category-report-list";
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
  getExpensesReport,
} from "@/lib/api/queries";
import {
  monthStartISO,
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
  const { from, to } = await resolveDateRange(params, { from: monthStartISO(), to: todayISO() });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground">
            Ingresos, egresos, ventas por categoría y medios de pago.
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
  const [sales, paymentMethods, topProducts, hourly, expenses] = await Promise.all([
    getReportsSales({ from, to }),
    getReportsPaymentMethods({ from, to }),
    // La API puede rechazar límites altos: probamos 50 y caemos a 20.
    getReportsTopProducts({ from, to, limit: 50 }).catch(() =>
      getReportsTopProducts({ from, to, limit: 20 }).catch(() => ({ data: [] as never[] }))
    ),
    getReportsHourlySales({ from, to }),
    // Si egresos falla, el resto del reporte debe seguir cargando.
    getExpensesReport({ from, to }).catch(() => ({ total: 0, count: 0 })),
  ]);

  const paymentTotal = paymentMethods.data.reduce((a, m) => a + m.net_total, 0);

  const dayLabel = (iso: string) =>
    new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(parseDateOnly(iso));
  const daysWithSales = sales.data.filter((d) => d.total > 0);
  const toDay = (d: (typeof sales.data)[number] | undefined) =>
    d ? { label: dayLabel(d.date), total: d.total, count: d.pos_count + d.online_count } : null;
  const best = daysWithSales.length ? daysWithSales.reduce((a, b) => (b.total > a.total ? b : a)) : undefined;
  const worst = daysWithSales.length ? daysWithSales.reduce((a, b) => (b.total < a.total ? b : a)) : undefined;

  const kpis: ReportKpis = {
    income: {
      total: sales.summary.total,
      pos: sales.summary.pos_total,
      online: sales.summary.online_total,
    },
    expenses: { total: expenses.total, count: expenses.count },
    bestDay: toDay(best),
    worstDay: toDay(worst),
  };

  // Ventas por categoría (con sus productos para el modal)
  const catMap = new Map<string, CategoryRow>();
  for (const p of topProducts.data) {
    const key = p.categoria || "Sin categoría";
    const row = catMap.get(key) ?? { categoria: key, total: 0, qty: 0, products: [] };
    row.total += p.total_vendido;
    row.qty += p.cantidad_vendida;
    row.products.push({ nombre: p.nombre_producto, cantidad: p.cantidad_vendida, total: p.total_vendido });
    catMap.set(key, row);
  }
  const byCategory = Array.from(catMap.values())
    .map((c) => ({ ...c, products: c.products.sort((a, b) => b.total - a.total) }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <ReportKpiCarousel kpis={kpis} />

      <Card className="rounded-[20px] p-5 shadow-sm">
        <SectionHeader icon={Columns3} title="Ventas" subtitle="POS y en línea, día a día" tone="accent" />
        <div className="mt-5">
          {sales.data.length ? (
            <ChannelBarChart data={sales.data} />
          ) : (
            <EmptyState icon={Columns3} title="Sin ventas en el periodo" />
          )}
        </div>
      </Card>

      <Card className="rounded-[20px] p-5 shadow-sm">
        <SectionHeader icon={Clock} title="Ventas por hora" subtitle="Horas de mayor venta" tone="accent" />
        <div className="mt-5">
          <HourlyBarChart data={hourly.data} />
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[20px] p-0 shadow-sm">
        <div className="p-5 pb-4">
          <SectionHeader icon={Layers} title="Ventas por categoría" subtitle="Toca una categoría para ver sus productos" tone="primary" />
        </div>
        {byCategory.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState icon={Layers} title="Sin ventas en el periodo" />
          </div>
        ) : (
          <CategoryReportList categories={byCategory} />
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4">
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
      </div>
    </div>
  );
}
