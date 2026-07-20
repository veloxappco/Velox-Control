import { Suspense } from "react";
import { PackageSearch, AlertTriangle, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/stat-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getInventoryAlerts, getIngredientConsumption } from "@/lib/api/queries";
import type { InventoryAlertItem } from "@/lib/api/types";
import { daysAgoISO, formatMoney, formatNumber, todayISO } from "@/lib/format";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function InventarioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const from = params.from ?? daysAgoISO(7);
  const to = params.to ?? todayISO();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            Stock bajo, negativos y consumo de insumos.
          </p>
        </div>
        <DateRangeFilter defaultFrom={from} defaultTo={to} />
      </div>

      <Suspense key={`${from}-${to}`} fallback={<Skeleton className="h-96 rounded-xl" />}>
        <InventarioContent from={from} to={to} />
      </Suspense>
    </div>
  );
}

async function InventarioContent({ from, to }: { from: string; to: string }) {
  const [alerts, consumption] = await Promise.all([
    getInventoryAlerts({ limit: 100 }),
    getIngredientConsumption({ from, to, limit: 15 }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Productos bajo stock"
          value={formatNumber(alerts.summary.low_stock_products)}
          icon={PackageSearch}
          accent="warning"
        />
        <StatCard
          label="Insumos bajo stock"
          value={formatNumber(alerts.summary.low_stock_ingredients)}
          icon={PackageSearch}
          accent="warning"
        />
        <StatCard
          label="Productos en negativo"
          value={formatNumber(alerts.summary.negative_products)}
          icon={AlertTriangle}
          accent="destructive"
        />
        <StatCard
          label="Insumos en negativo"
          value={formatNumber(alerts.summary.negative_ingredients)}
          icon={AlertTriangle}
          accent="destructive"
        />
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Productos ({alerts.products.length})</TabsTrigger>
          <TabsTrigger value="ingredients">Insumos ({alerts.ingredients.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <StockTable items={alerts.products} emptyLabel="Sin alertas de productos" />
        </TabsContent>
        <TabsContent value="ingredients">
          <StockTable items={alerts.ingredients} emptyLabel="Sin alertas de insumos" showUnit />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="size-4" /> Consumo de insumos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {consumption.data.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={TrendingDown} title="Sin consumo registrado en el periodo" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead className="text-right">Cantidad usada</TableHead>
                  <TableHead className="text-right">Costo total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumption.data.map((item) => (
                  <TableRow key={item.ingredient_id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(item.quantity)} {item.unit ?? ""}
                    </TableCell>
                    <TableCell className="text-right">{formatMoney(item.total_cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StockTable({
  items,
  emptyLabel,
  showUnit = false,
}: {
  items: InventoryAlertItem[];
  emptyLabel: string;
  showUnit?: boolean;
}) {
  if (items.length === 0) {
    return <EmptyState icon={PackageSearch} title={emptyLabel} />;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Mínimo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">
                  {formatNumber(item.stock)} {showUnit ? item.unit ?? "" : ""}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatNumber(item.min_stock)}
                </TableCell>
                <TableCell>
                  <Badge variant={item.is_negative ? "destructive" : "warning"}>
                    {item.is_negative ? "Negativo" : "Stock bajo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
