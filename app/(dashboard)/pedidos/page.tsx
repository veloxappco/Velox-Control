import { Suspense } from "react";
import { ClipboardList, ShoppingBag } from "lucide-react";
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
import { getOrdersSummary, getOrdersRecent, getOrdersPending } from "@/lib/api/queries";
import type { OrderListItem } from "@/lib/api/types";
import {
  formatDateTime,
  formatMoney,
  formatNumber,
  orderStatusLabel,
  orderStatusVariant,
  paymentMethodLabel,
  todayISO,
} from "@/lib/format";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function PedidosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const from = params.from ?? todayISO();
  const to = params.to ?? todayISO();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">Pedidos en línea y su estado.</p>
        </div>
        <DateRangeFilter />
      </div>

      <Suspense key={`${from}-${to}`} fallback={<Skeleton className="h-96 rounded-xl" />}>
        <PedidosContent from={from} to={to} />
      </Suspense>
    </div>
  );
}

async function PedidosContent({ from, to }: { from: string; to: string }) {
  const [summary, recent, pending] = await Promise.all([
    getOrdersSummary({ from, to }),
    getOrdersRecent({ limit: 30 }),
    getOrdersPending({ limit: 30 }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Total pedidos"
          value={formatNumber(summary.summary.count)}
          icon={ClipboardList}
        />
        <StatCard
          label="Total completado"
          value={formatMoney(summary.summary.completed_total)}
          icon={ShoppingBag}
          accent="success"
        />
        {summary.summary.statuses.slice(0, 2).map((s) => (
          <StatCard
            key={s.status}
            label={orderStatusLabel(s.status)}
            value={formatNumber(s.count)}
            icon={ClipboardList}
            accent="accent"
          />
        ))}
      </div>

      {summary.summary.statuses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {summary.summary.statuses.map((s) => (
            <Badge key={s.status} variant={orderStatusVariant(s.status)}>
              {orderStatusLabel(s.status)} · {s.count}
            </Badge>
          ))}
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendientes ({pending.data.length})</TabsTrigger>
          <TabsTrigger value="recent">Recientes ({recent.data.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <OrdersTable orders={pending.data} emptyLabel="No hay pedidos pendientes" />
        </TabsContent>
        <TabsContent value="recent">
          <OrdersTable orders={recent.data} emptyLabel="Sin pedidos recientes" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrdersTable({ orders, emptyLabel }: { orders: OrderListItem[]; emptyLabel: string }) {
  if (orders.length === 0) {
    return <EmptyState icon={ClipboardList} title={emptyLabel} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>{order.customer_name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={orderStatusVariant(order.status)}>
                    {orderStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.payment_method ? paymentMethodLabel(order.payment_method) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(order.total)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(order.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
