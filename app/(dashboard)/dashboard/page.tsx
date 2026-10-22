import { Suspense } from "react";
import { DollarSign, ShoppingBag, Store, Receipt } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesBreakdown } from "@/components/dashboard/sales-breakdown";
import { SalesByDayCard } from "@/components/dashboard/sales-by-day-card";
import { StockAlerts } from "@/components/dashboard/stock-alerts";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
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

      <StockAlerts items={[...alerts.products, ...alerts.ingredients].slice(0, 6)} />
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
