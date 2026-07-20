import { DollarSign, Globe2, Store, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
          <ChannelStat
            label="Ventas totales"
            value={formatMoney(total)}
            sub={`${formatNumber(sales.count)} ventas · ticket prom. ${formatMoney(sales.average_ticket)}`}
            icon={DollarSign}
            accent="primary"
          />
          <ChannelStat
            label="Pedidos en línea"
            value={formatMoney(onlineTotal)}
            sub={`${formatNumber(sales.online.completed)} pedidos completados`}
            icon={Globe2}
            accent="accent"
          />
          <ChannelStat
            label="Venta POS"
            value={formatMoney(posTotal)}
            sub={`${formatNumber(sales.pos.count)} ventas en caja`}
            icon={Store}
            accent="success"
          />
        </div>

        {denom > 0 && (
          <div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="bg-accent transition-all" style={{ width: `${onlinePct}%` }} />
              <div className="bg-success transition-all" style={{ width: `${posPct}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-accent" /> En línea {onlinePct}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-success" /> POS {posPct}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChannelStat({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  accent: "primary" | "accent" | "success";
}) {
  const accentClasses: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    accent: "bg-accent/15 text-accent",
    success: "bg-success/15 text-success",
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/20 p-4">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          accentClasses[accent]
        )}
      >
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-lg font-semibold">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
