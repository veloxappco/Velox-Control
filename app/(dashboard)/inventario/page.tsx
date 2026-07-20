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
import { WhatsappIcon } from "@/components/icons/whatsapp-icon";
import { getInventoryAlerts, getIngredientConsumption } from "@/lib/api/queries";
import type { InventoryAlertItem, IngredientConsumptionItem } from "@/lib/api/types";
import { daysAgoISO, formatMoney, formatNumber, todayISO } from "@/lib/format";
import { resolveDateRange } from "@/lib/get-date-range";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function InventarioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { from, to } = await resolveDateRange(params, { from: daysAgoISO(7), to: todayISO() });

  return (
    <div className="flex min-w-0 flex-col gap-6">
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
    <div className="flex min-w-0 flex-col gap-6">
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
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="products">Productos ({alerts.products.length})</TabsTrigger>
            <TabsTrigger value="ingredients">Insumos ({alerts.ingredients.length})</TabsTrigger>
          </TabsList>
          <InventoryShareButton products={alerts.products} ingredients={alerts.ingredients} />
        </div>
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
        <CardContent className={consumption.data.length === 0 ? undefined : "p-0"}>
          <ConsumptionSection items={consumption.data} />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Botón "Compartir por WhatsApp" ----------
// Es un <a target="_blank"> normal a wa.me con el texto ya armado — no
// necesita JS en el navegador (no hace falta "use client").
function InventoryShareButton({
  products,
  ingredients,
}: {
  products: InventoryAlertItem[];
  ingredients: InventoryAlertItem[];
}) {
  const message = buildWhatsappMessage(products, ingredients);
  const href = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
    >
      <WhatsappIcon className="size-4" />
      Compartir
    </a>
  );
}

function buildWhatsappMessage(products: InventoryAlertItem[], ingredients: InventoryAlertItem[]) {
  const lines: string[] = ["*Inventario — Stock bajo*", ""];

  if (products.length > 0) {
    lines.push(`*Productos* (${products.length})`);
    for (const p of products) {
      lines.push(`• ${p.name} — Stock: ${formatNumber(p.stock)} / Mín: ${formatNumber(p.min_stock)}`);
    }
    lines.push("");
  }

  if (ingredients.length > 0) {
    lines.push(`*Insumos* (${ingredients.length})`);
    for (const i of ingredients) {
      const unit = i.unit ? ` ${i.unit}` : "";
      lines.push(
        `• ${i.name} — Stock: ${formatNumber(i.stock)}${unit} / Mín: ${formatNumber(i.min_stock)}${unit}`
      );
    }
  }

  if (products.length === 0 && ingredients.length === 0) {
    lines.push("Sin alertas de stock por el momento. ✅");
  }

  return lines.join("\n");
}

// ---------- Tabla de stock — MF (Mobile First): tarjetas en mobile, tabla desde md ----------
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
    <div className="flex min-w-0 flex-col gap-2">
      {/* Mobile: tarjetas apiladas, cero scroll horizontal */}
      <div className="flex min-w-0 flex-col gap-2 md:hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="min-w-0 rounded-xl border border-border bg-card p-3.5 shadow-sm"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium">{item.name}</p>
              <Badge variant={item.is_negative ? "destructive" : "warning"} className="shrink-0">
                {item.is_negative ? "Negativo" : "Stock bajo"}
              </Badge>
            </div>
            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="truncate">
                Stock:{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(item.stock)}
                  {showUnit && item.unit ? ` ${item.unit}` : ""}
                </span>
              </span>
              <span className="truncate">
                Mínimo: <span className="font-medium text-foreground">{formatNumber(item.min_stock)}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: tabla completa */}
      <Card className="hidden md:block">
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
    </div>
  );
}

// ---------- Consumo de insumos — MF, con costo total del periodo ----------
function ConsumptionSection({ items }: { items: IngredientConsumptionItem[] }) {
  if (items.length === 0) {
    return <EmptyState icon={TrendingDown} title="Sin consumo registrado en el periodo" />;
  }

  const totalCost = items.reduce((acc, item) => acc + item.total_cost, 0);

  return (
    <div className="flex min-w-0 flex-col gap-3 p-5 md:p-0">
      <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-secondary/40 px-4 py-3 md:mx-5 md:mt-5">
        <span className="text-sm text-muted-foreground">
          Costo total del periodo ({items.length} insumo{items.length === 1 ? "" : "s"})
        </span>
        <span className="shrink-0 text-lg font-semibold">{formatMoney(totalCost)}</span>
      </div>

      {/* Mobile: tarjetas */}
      <div className="flex min-w-0 flex-col gap-2 md:hidden">
        {items.map((item) => (
          <div
            key={item.ingredient_id}
            className="min-w-0 rounded-xl border border-border bg-card p-3.5 shadow-sm"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium">{item.name}</p>
              <span className="shrink-0 text-sm font-semibold">{formatMoney(item.total_cost)}</span>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {formatNumber(item.quantity)} {item.unit ?? ""} consumidos
            </p>
          </div>
        ))}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Insumo</TableHead>
              <TableHead className="text-right">Cantidad usada</TableHead>
              <TableHead className="text-right">Costo total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.ingredient_id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">
                  {formatNumber(item.quantity)} {item.unit ?? ""}
                </TableCell>
                <TableCell className="text-right">{formatMoney(item.total_cost)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="hover:bg-transparent">
              <TableCell className="font-semibold">Total</TableCell>
              <TableCell />
              <TableCell className="text-right font-semibold">{formatMoney(totalCost)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
