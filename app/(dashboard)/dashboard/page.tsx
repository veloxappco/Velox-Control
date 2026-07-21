import { Suspense } from "react";
import {
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
  PackageSearch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesBreakdown } from "@/components/dashboard/sales-breakdown";
import { SalesAreaChart } from "@/components/dashboard/sales-area-chart";
import { HourlyBarChart } from "@/components/dashboard/hourly-bar-chart";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardSummary,
  getReportsSales,
  getReportsHourlySales,
  getOrdersPending,
  getInventoryAlerts,
} from "@/lib/api/queries";
import { formatMoney, formatNumber, orderStatusLabel, orderStatusVariant, todayISO } from "@/lib/format";
import { resolveDateRange } from "@/lib/get-date-range";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { from, to } = await resolveDateRange(params, { from: todayISO(), to: todayISO() });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Resumen</h1>
          <p className="text-sm text-muted-foreground">
            Vista general del negocio en el periodo seleccionado.
          </p>
        </div>
        <DateRangeFilter defaultFrom={from} defaultTo={to} />
      </div>

      <Suspense key={`${from}-${to}`} fallback={<DashboardSkeleton />}>
        <DashboardContent from={from} to={to} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({ from, to }: { from: string; to: string }) {
  const [summary, sales, hourly, pending, alerts] = await Promise.all([
    getDashboardSummary({ from, to }),
    getReportsSales({ from, to }),
    getReportsHourlySales({ from, to }),
    getOrdersPending({ limit: 6 }),
    getInventoryAlerts({ limit: 6 }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <StatCard
          label="Ventas totales"
          value={formatMoney(summary.sales.total)}
          sub={`${formatNumber(summary.sales.count)} ventas · ticket ${formatMoney(summary.sales.average_ticket)}`}
          icon={DollarSign}
          accent="primary"
          variant="solid"
          valueClassName="text-4xl"
        />
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Pedidos"
            value={formatNumber(summary.orders.count)}
            sub={`${summary.orders.pending} pendientes · ${summary.orders.completed} completados`}
            icon={ShoppingBag}
            accent="accent"
            size="compact"
            valueClassName="text-2xl"
          />
          <StatCard
            label="Total ventas"
            value={formatNumber(summary.sales.pos.count + summary.sales.online.completed)}
            sub={`${formatNumber(summary.sales.pos.count)} POS · ${formatNumber(summary.sales.online.completed)} en línea`}
            icon={ShoppingCart}
            accent="success"
            size="compact"
            valueClassName="text-2xl"
          />
        </div>
      </div>

      <SalesBreakdown sales={summary.sales} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tendencia de ventas</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.data.length ? (
              <SalesAreaChart data={sales.data} />
            ) : (
              <EmptyState icon={DollarSign} title="Sin ventas en este periodo" />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventas por hora</CardTitle>
          </CardHeader>
          <CardContent>
            <HourlyBarChart data={hourly.data} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-4" /> Pedidos pendientes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {pending.data.length === 0 && (
              <EmptyState icon={ClipboardList} title="No hay pedidos pendientes" />
            )}
            {pending.data.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.customer_name ?? "Cliente sin nombre"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-medium">{formatMoney(order.total)}</span>
                  <Badge variant={orderStatusVariant(order.status)}>
                    {orderStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <PackageSearch className="size-4" /> Stock bajo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[...alerts.products, ...alerts.ingredients].length === 0 && (
              <EmptyState icon={PackageSearch} title="Inventario en buen estado" />
            )}
            {[...alerts.products, ...alerts.ingredients].slice(0, 6).map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.type === "product" ? "Producto" : "Insumo"}</p>
                </div>
                <Badge variant={item.is_negative ? "destructive" : "warning"}>
                  {formatNumber(item.stock)} / min {formatNumber(item.min_stock)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-28 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Skeleton className="h-[340px] rounded-xl lg:col-span-3" />
        <Skeleton className="h-[340px] rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}
