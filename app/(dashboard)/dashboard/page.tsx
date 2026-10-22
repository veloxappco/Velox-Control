import { Suspense } from "react";
import { DollarSign, ShoppingBag, Store, PackageSearch, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesBreakdown } from "@/components/dashboard/sales-breakdown";
import { SalesByDayCard } from "@/components/dashboard/sales-by-day-card";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardSummary,
  getReportsSales,
  getExpensesReport,
  getInventoryAlerts,
} from "@/lib/api/queries";
import { formatMoney, formatNumber, todayISO } from "@/lib/format";
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
          <h1>Resumen</h1>
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
  const [summary, sales, expenses, alerts] = await Promise.all([
    getDashboardSummary({ from, to }),
    getReportsSales({ from, to }),
    // Egresos respeta el filtro; si falla, el resto del resumen sigue cargando.
    getExpensesReport({ from, to }).catch(() => null),
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
            icon={ShoppingBag}
            accent="accent"
            size="compact"
            iconSize="lg"
            valueClassName="text-2xl"
          />
          <StatCard
            label="Total ventas"
            value={formatNumber(summary.sales.pos.count + summary.sales.online.completed)}
            icon={Store}
            accent="success"
            size="compact"
            iconSize="lg"
            valueClassName="text-2xl"
          />
        </div>
      </div>

      <SalesBreakdown sales={summary.sales} />

      <SalesByDayCard data={sales.data} />

      {expenses && (
        <div className="flex min-w-0 flex-col gap-3">
          <StatCard
            label="Egresos"
            value={formatMoney(expenses.total)}
            sub={`${formatNumber(expenses.count)} movimiento${expenses.count === 1 ? "" : "s"}${
              expenses.categories[0] ? ` · mayor: ${expenses.categories[0].category}` : ""
            }`}
            icon={Receipt}
            accent="warning"
            variant="solid"
            valueClassName="text-3xl"
          />
          <CategoryBreakdown
            categories={expenses.categories}
            movements={expenses.movements}
            total={expenses.total}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold text-foreground">
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
      <Skeleton className="h-[340px] rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
