import { formatMoney } from "@/lib/format";
import { getCashBreakdown } from "@/lib/cash";
import { cn } from "@/lib/utils";
import type { CashSession } from "@/lib/api/types";

export function CashReconciliation({ session }: { session: CashSession }) {
  const { income, expense, expected, diff } = getCashBreakdown(session);
  const closed = session.closing_amount !== null;

  return (
    <div className="flex min-w-0 flex-col gap-2.5 text-sm">
      <Row label="Base inicial" value={formatMoney(session.opening_amount)} />
      <Row label="+ Ingresos (Efectivo)" value={formatMoney(income)} tone="success" />
      <Row label="- Egresos (Efectivo)" value={formatMoney(expense)} tone="destructive" />

      <div className="my-1 border-t border-border" />

      <Row label="Efectivo esperado" value={formatMoney(expected)} bold />

      {closed && (
        <>
          <div className="my-1 border-t border-dashed border-border/60" />
          <Row label="Cierre real" value={formatMoney(session.closing_amount!)} />
          <Row
            label="Diferencia"
            value={`${diff !== null && diff > 0 ? "+ " : ""}${formatMoney(diff ?? 0)}`}
            tone={diff !== null && diff < 0 ? "destructive" : diff !== null && diff > 0 ? "success" : undefined}
            bold
          />
        </>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive";
  bold?: boolean;
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";

  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className={cn("min-w-0 truncate text-muted-foreground", bold && "font-semibold text-foreground")}>
        {label}
      </span>
      <span className={cn("shrink-0 font-medium", toneClass, bold && "text-base font-semibold")}>
        {value}
      </span>
    </div>
  );
}
