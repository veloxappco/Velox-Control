import { DollarSign, Globe2, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatMoney, formatNumber } from "@/lib/format";
import type { DashboardSummary } from "@/lib/api/types";

export function SalesBreakdown({
  sales,
  title = "Ventas por canal",
}: {
  sales: DashboardSummary["sales"];
  title?: string;
}) {
  const total = sales.total || 0;
  const onlineTotal = sales.online.total || 0;
  const posTotal = sales.pos.total || 0;
  const denom = onlineTotal + posTotal;
  const onlinePct = denom > 0 ? Math.round((onlineTotal / denom) * 100) : 0;
  const posPct = denom > 0 ? 100 - onlinePct : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Ventas totales"
            value={formatMoney(total)}
            sub={`${formatNumber(sales.count)} ventas · ticket prom. ${formatMoney(sales.average_ticket)}`}
            icon={DollarSign}
            accent="primary"
            variant="solid"
          />
          <StatCard
            label="Venta POS"
            value={formatMoney(posTotal)}
            sub={`${formatNumber(sales.pos.count)} ventas en caja`}
            icon={Store}
            accent="accent"
            variant="solid"
          />
          <StatCard
            label="Pedidos en línea"
            value={formatMoney(onlineTotal)}
            sub={`${formatNumber(sales.online.completed)} pedidos completados`}
            icon={Globe2}
            accent="success"
            variant="solid"
          />
        </div>

        {denom > 0 && (
          <div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="bg-success transition-all" style={{ width: `${onlinePct}%` }} />
              <div className="bg-accent transition-all" style={{ width: `${posPct}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-success" /> En línea {onlinePct}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-accent" /> POS {posPct}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
