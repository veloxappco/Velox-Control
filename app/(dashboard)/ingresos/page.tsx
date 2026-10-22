import { Suspense } from "react";
import { SalesBreakdown } from "@/components/dashboard/sales-breakdown";
import { ItemRemovalLogs } from "@/components/dashboard/item-removal-logs";
import { IngresosTabs } from "@/components/dashboard/ingresos-tabs";
import { PosModule } from "@/components/dashboard/pos-module";
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
            Gestión del día o entre fechas: pedidos, ventas POS y productos eliminados.
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

      <IngresosTabs
        tabs={[
          {
            value: "pedidos",
            label: "Pedidos",
            count: ordersInRange.length,
            content: <OrdersModule orders={ordersInRange} />,
          },
          {
            value: "pos",
            label: "Ventas POS",
            count: (posAccounts?.data.filter((a) => a.status !== "paid").length ?? 0) + (posSales?.meta.total ?? 0),
            content:
              posAccounts || posSales ? (
                <PosModule
                  accounts={posAccounts?.data ?? []}
                  sales={posSales?.data ?? []}
                  salesTotal={posSales?.meta.total ?? 0}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No se pudieron cargar las ventas POS.</p>
              ),
          },
          {
            value: "top",
            label: "Top",
            content: <TopProductsPodium products={topProducts.data} />,
          },
          {
            value: "eliminados",
            label: "Eliminados",
            count: removalLogs?.meta.total ?? 0,
            content: removalLogs ? (
              <ItemRemovalLogs logs={removalLogs.data} total={removalLogs.meta.total} />
            ) : (
              <p className="text-sm text-muted-foreground">No se pudo cargar el historial.</p>
            ),
          },
        ]}
      />
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
