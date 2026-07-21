import { Info, ShoppingBag, ShoppingCart, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney, formatNumber } from "@/lib/format";
import type { DashboardSummary } from "@/lib/api/types";

// Tarjeta de análisis (no un grupo de KPIs): total del periodo, barra de
// distribución por canal y el detalle de cada canal lado a lado.
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
    <Card className="rounded-[20px] p-5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
        <Info className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-5 min-w-0">
        <p className="text-xs font-medium text-muted-foreground">Total de ventas</p>
        <p className="mt-1 truncate font-display text-4xl font-extrabold tracking-tight text-foreground">
          {formatMoney(total)}
        </p>
      </div>

      {denom > 0 && (
        <div className="mt-4">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div className="bg-accent transition-all" style={{ width: `${posPct}%` }} />
            <div className="bg-success transition-all" style={{ width: `${onlinePct}%` }} />
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="flex items-center gap-1.5 font-display text-sm font-semibold text-foreground">
              <span className="size-2.5 shrink-0 rounded-full bg-accent" /> POS {posPct}%
            </span>
            <span className="flex items-center gap-1.5 font-display text-sm font-semibold text-foreground">
              <span className="size-2.5 shrink-0 rounded-full bg-success" /> En línea {onlinePct}%
            </span>
          </div>
        </div>
      )}

      <div className="my-5 h-px bg-border/60" />

      <div className="grid grid-cols-2 divide-x divide-border/60">
        <ChannelDetail
          icon={ShoppingCart}
          label="POS"
          labelClass="text-accent"
          iconBg="bg-accent/10"
          iconColor="text-accent"
          value={formatMoney(posTotal)}
          sub={`${formatNumber(sales.pos.count)} ventas`}
          className="pr-3"
        />
        <ChannelDetail
          icon={ShoppingBag}
          label="En línea"
          labelClass="text-success"
          iconBg="bg-success/10"
          iconColor="text-success"
          value={formatMoney(onlineTotal)}
          sub={`${formatNumber(sales.online.completed)} pedidos`}
          className="pl-3"
        />
      </div>
    </Card>
  );
}

function ChannelDetail({
  icon: Icon,
  label,
  labelClass,
  iconBg,
  iconColor,
  value,
  sub,
  className,
}: {
  icon: LucideIcon;
  label: string;
  labelClass: string;
  iconBg: string;
  iconColor: string;
  value: string;
  sub: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-start gap-2.5", className)}>
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", iconBg)}>
        <Icon className={cn("size-4.5", iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-display text-sm font-bold", labelClass)}>{label}</p>
        {/* truncate (nunca break-words): garantiza una sola línea, nunca se
         * corta la cifra a la mitad como pasaba con el salto de palabra. */}
        <p className="mt-0.5 truncate font-display text-lg font-extrabold text-foreground">
          {value}
        </p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
