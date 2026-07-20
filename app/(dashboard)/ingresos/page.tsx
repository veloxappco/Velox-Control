import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesBreakdown } from "@/components/dashboard/sales-breakdown";
import { OrdersModule } from "@/components/dashboard/orders-module";
import { TopProductsPodium } from "@/components/dashboard/top-products-podium";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardSummary, getOrdersRecent, getReportsTopProducts } from "@/lib/api/queries";
import { todayISO } from "@/lib/format";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function IngresosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const from = params.from ?? todayISO();
  const to = params.to ?? todayISO();

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
  const [summary, orders, topProducts] = await Promise.all([
    getDashboardSummary({ from, to }),
    getOrdersRecent({ limit: 100 }),
    getReportsTopProducts({ from, to, limit: 20 }),
  ]);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <SalesBreakdown sales={summary.sales} title="Ingresos por canal" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-4" /> Pedidos en línea
          </CardTitle>
        </CardHeader>
        <div className="px-5 pb-5">
          <OrdersModule orders={orders.data} />
        </div>
      </Card>

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
