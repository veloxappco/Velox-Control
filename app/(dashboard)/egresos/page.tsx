import { Suspense } from "react";
import { Receipt, ListChecks, Tags } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { getExpensesReport } from "@/lib/api/queries";
import { formatMoney, formatNumber, todayISO } from "@/lib/format";
import { resolveDateRange } from "@/lib/get-date-range";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function EgresosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  // Por defecto filtra solo el día de hoy (no un rango) — igual que Resumen y Pedidos.
  const { from, to } = await resolveDateRange(params, { from: todayISO(), to: todayISO() });

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Egresos</h1>
          <p className="truncate text-sm text-muted-foreground">Gastos registrados en caja</p>
        </div>
        <DateRangeFilter defaultFrom={from} defaultTo={to} />
      </div>

      <Suspense key={`${from}-${to}`} fallback={<Skeleton className="h-96 rounded-xl" />}>
        <EgresosContent from={from} to={to} />
      </Suspense>
    </div>
  );
}

async function EgresosContent({ from, to }: { from: string; to: string }) {
  const report = await getExpensesReport({ from, to });
  const topCategory = report.categories[0];

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-3">
        <StatCard
          label="Total egresos"
          value={formatMoney(report.total)}
          icon={Receipt}
          accent="warning"
          variant="solid"
          valueClassName="text-4xl"
        />
        <div className="grid grid-cols-5 gap-3">
          <StatCard
            label="Movimientos"
            value={formatNumber(report.count)}
            icon={ListChecks}
            accent="success"
            size="compact"
            valueClassName="text-2xl"
            className="col-span-2"
          />
          <StatCard
            label="Categoría principal"
            value={topCategory ? topCategory.category : "—"}
            sub={topCategory ? formatMoney(topCategory.total) : undefined}
            icon={Tags}
            accent="success"
            size="compact"
            className="col-span-3"
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs text-muted-foreground">
          Toca una categoría para ver el detalle de sus movimientos.
        </p>
        <CategoryBreakdown
          categories={report.categories}
          movements={report.movements}
          total={report.total}
        />
      </div>
    </div>
  );
}
