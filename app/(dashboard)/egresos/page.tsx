import { Suspense } from "react";
import { Receipt, ListChecks, Tags, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ExpensesList } from "@/components/dashboard/expenses-list";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getExpensesReport } from "@/lib/api/queries";
import { daysAgoISO, formatMoney, formatNumber, todayISO } from "@/lib/format";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function EgresosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const from = params.from ?? daysAgoISO(30);
  const to = params.to ?? todayISO();

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Egresos</h1>
          <p className="text-sm text-muted-foreground">
            Gastos registrados en caja: por categoría y con su descripción.
          </p>
        </div>
        <DateRangeFilter />
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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Total egresos"
          value={formatMoney(report.total)}
          icon={Receipt}
          accent="destructive"
        />
        <StatCard
          label="Movimientos"
          value={formatNumber(report.count)}
          icon={ListChecks}
          accent="accent"
        />
        <StatCard
          label="Categoría principal"
          value={topCategory ? topCategory.category : "—"}
          sub={topCategory ? formatMoney(topCategory.total) : undefined}
          icon={Tags}
          accent="warning"
        />
        <StatCard
          label="Promedio por egreso"
          value={formatMoney(report.count > 0 ? report.total / report.count : 0)}
          icon={Calculator}
          accent="primary"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Egresos por categoría</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {report.categories.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Tags} title="Sin egresos en este periodo" />
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/60">
              {report.categories.map((c) => {
                const pct = report.total > 0 ? Math.round((c.total / report.total) * 100) : 0;
                return (
                  <div key={c.category} className="flex min-w-0 flex-col gap-1.5 px-5 py-3">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-medium">
                        {c.category}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({c.count})
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-medium">{formatMoney(c.total)}</span>
                    </div>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-gradient-brand transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Detalle de movimientos ({report.count})
        </h2>
        <ExpensesList movements={report.movements} />
      </div>
    </div>
  );
}
