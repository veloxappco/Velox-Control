import { Suspense } from "react";
import { TrendingUp, CreditCard, Trophy, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesAreaChart } from "@/components/dashboard/sales-area-chart";
import { HourlyBarChart } from "@/components/dashboard/hourly-bar-chart";
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
import { daysAgoISO, formatMoney, formatNumber, paymentMethodLabel, todayISO } from "@/lib/format";
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

async function ReportesContent({ from, to }: { from: string; to: string }) {
  const [sales, paymentMethods, topProducts, hourly, profit] = await Promise.all([
    getReportsSales({ from, to }),
    getReportsPaymentMethods({ from, to }),
    getReportsTopProducts({ from, to, limit: 10 }),
    getReportsHourlySales({ from, to }),
    getReportsProfit({ from, to }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ingresos" value={formatMoney(profit.summary.revenue)} icon={TrendingUp} />
        <StatCard
          label="Costo"
          value={formatMoney(profit.summary.cost)}
          icon={TrendingUp}
          accent="destructive"
        />
        <StatCard
          label="Utilidad bruta"
          value={formatMoney(profit.summary.gross_profit)}
          icon={TrendingUp}
          accent="success"
        />
        <StatCard
          label="Margen bruto"
          value={`${profit.summary.gross_margin_percent}%`}
          icon={Percent}
          accent="accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Ventas por día</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.data.length ? (
              <SalesAreaChart data={sales.data} />
            ) : (
              <EmptyState icon={TrendingUp} title="Sin ventas en el periodo" />
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-4" /> Medios de pago
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {paymentMethods.data.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={CreditCard} title="Sin transacciones en el periodo" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Transacciones</TableHead>
                    <TableHead className="text-right">Neto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.data.map((m) => (
                    <TableRow key={m.payment_method}>
                      <TableCell className="font-medium">
                        {paymentMethodLabel(m.payment_method)}
                      </TableCell>
                      <TableCell className="text-right">{m.transactions}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMoney(m.net_total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-4" /> Productos más vendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.data.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={Trophy} title="Sin ventas de productos en el periodo" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.data.map((p, i) => (
                    <TableRow key={p.producto_id ?? i}>
                      <TableCell>
                        <p className="font-medium">{p.nombre_producto}</p>
                        <p className="text-xs text-muted-foreground">{p.categoria}</p>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(p.cantidad_vendida)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMoney(p.total_vendido)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {p.porcentaje_participacion}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
