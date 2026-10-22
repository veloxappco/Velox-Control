import { ChevronsRight } from "lucide-react";
import { formatMoney, formatNumber } from "@/lib/format";
import { FitText } from "@/components/shared/fit-text";

export interface ReportKpis {
  income: { total: number; pos: number; online: number };
  expenses: { total: number; count: number };
  bestDay: { label: string; total: number; count: number } | null;
  worstDay: { label: string; total: number; count: number } | null;
}

const CARD = "flex min-w-0 shrink-0 snap-center flex-col justify-between gap-4 rounded-2xl p-5 text-white shadow-sm";

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl bg-white/20 px-3.5 py-3">
      <p className="truncate text-xs font-medium text-white/85">{label}</p>
      <FitText className="mt-0.5 font-display text-lg font-bold">{value}</FitText>
    </div>
  );
}

function DayCard({
  title,
  day,
  className,
}: {
  title: string;
  day: ReportKpis["bestDay"];
  className: string;
}) {
  return (
    <div className={`${CARD} ${className}`}>
      <p className="font-display text-base font-semibold text-white/90">{title}</p>
      <FitText className="font-display text-4xl font-bold tracking-tight">
        {day ? formatMoney(day.total) : "—"}
      </FitText>
      <div className="flex min-w-0 gap-2">
        <Pill label="Fecha" value={day ? day.label : "—"} />
        <Pill label="Ventas" value={day ? formatNumber(day.count) : "—"} />
      </div>
    </div>
  );
}

export function ReportKpiCarousel({ kpis }: { kpis: ReportKpis }) {
  const w = "w-[86%] sm:w-[420px]";
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={`${CARD} ${w} bg-success`}>
          <p className="font-display text-base font-semibold text-white/90">Total ingresos</p>
          <FitText className="font-display text-4xl font-bold tracking-tight">
            {formatMoney(kpis.income.total)}
          </FitText>
          <div className="flex min-w-0 gap-2">
            <Pill label="Ventas POS" value={formatMoney(kpis.income.pos)} />
            <Pill label="Pedidos" value={formatMoney(kpis.income.online)} />
          </div>
        </div>

        <div className={`${CARD} ${w} bg-warning`}>
          <p className="font-display text-base font-semibold text-white/90">Egresos</p>
          <FitText className="font-display text-4xl font-bold tracking-tight">
            {formatMoney(kpis.expenses.total)}
          </FitText>
          <div className="flex min-w-0 gap-2">
            <Pill label="Cajas con egresos" value={formatNumber(kpis.expenses.count)} />
            <Pill
              label="% de ingresos"
              value={`${kpis.income.total > 0 ? Math.round((kpis.expenses.total / kpis.income.total) * 100) : 0}%`}
            />
          </div>
        </div>

        <DayCard title="Mejor día" day={kpis.bestDay} className={`${w} bg-primary`} />
        <DayCard title="Peor día" day={kpis.worstDay} className={`${w} bg-destructive`} />
      </div>
      <p className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
        Desliza para ver más <ChevronsRight className="size-4" />
      </p>
    </div>
  );
}
