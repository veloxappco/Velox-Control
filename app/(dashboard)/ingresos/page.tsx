import { Suspense } from "react";
import { SalesBreakdown } from "@/components/dashboard/sales-breakdown";
import { ItemRemovalLogs } from "@/components/dashboard/item-removal-logs";
import { PosAccountsModule } from "@/components/dashboard/pos-accounts-module";
import { PosSalesModule } from "@/components/dashboard/pos-sales-module";
import { OrdersModule } from "@/components/dashboard/orders-module";
import { TopProductsPodium } from "@/components/dashboard/top-products-podium";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardSummary, getItemRemovalLogs, getOrdersRecent, getPosAccounts, getPosSales, getReportsTopProducts } from "@/lib/api/queries";
import { isoDateOnly, todayISO } from "@/lib/format";
import { resolveDateRange } from "@/lib/get-date-range";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function IngresosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { from, to } = await resolveDateRange(params, { from: todayISO(), to: todayISO() });

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Ingresos</h1>
          <p className="text-sm text-muted-foreground">
            Venta POS y pedidos en línea — todo lo que entra al negocio.
          </p>
        </div>
        <DateRangeFilter defaultFrom={from} defaultTo={to} />
      </div>

      <Suspense key={`${from}-${to}`} fallback={<IngresosSkeleton />}>
        <IngresosContent from={from} to={to} />
      </Suspense>
    </div>
  );
}

async function IngresosContent({ from, to }: { from: string; to: string }) {
  const [summary, orders, topProducts, posSales, posAccounts, removalLogs] = await Promise.all([
    getDashboardSummary({ from, to }),
    // /orders/recent no acepta from/to (solo limit), así que traemos los 100
    // más recientes (el máximo que permite la API) y filtramos por fecha acá.
    getOrdersRecent({ limit: 100 }),
    getReportsTopProducts({ from, to, limit: 20 }),
    // Si las ventas POS fallan, el resto de Ingresos debe seguir cargando.
    getPosSales({ from, to, per_page: 100 }).catch(() => null),
    // Cuentas abiertas (mesas / para llevar): en vivo, no dependen del rango de fechas.
    getPosAccounts({ status: "open", per_page: 50 }).catch(() => null),
    getItemRemovalLogs({ from, to, per_page: 100 }).catch(() => null),
  ]);

  const ordersInRange = orders.data.filter((order) => {
    const orderDate = isoDateOnly(order.created_at);
    return orderDate >= from && orderDate <= to;
  });

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <SalesBreakdown sales={summary.sales} title="Ingresos por canal" />

      {posAccounts && <PosAccountsModule accounts={posAccounts.data} />}

      <OrdersModule orders={ordersInRange} />

      {posSales && <PosSalesModule sales={posSales.data} total={posSales.meta.total} />}

      {removalLogs && <ItemRemovalLogs logs={removalLogs.data} total={removalLogs.meta.total} />}

      <TopProductsPodium products={topProducts.data} />
    </div>
  );
}

function IngresosSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
