import { Suspense } from "react";
import Link from "next/link";
import { Wallet, ArrowUpRight, ArrowDownRight, ChevronRight, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/dashboard/stat-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getCashCurrent, getCashSessions } from "@/lib/api/queries";
import { daysAgoISO, formatDateTime, formatMoney, formatShiftRange, todayISO } from "@/lib/format";
import { resolveDateRange } from "@/lib/get-date-range";
import { computeExpectedCash } from "@/lib/cash";
import { cn } from "@/lib/utils";
import type { CashSession } from "@/lib/api/types";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function CajaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { from, to } = await resolveDateRange(params, { from: daysAgoISO(14), to: todayISO() });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Caja</h1>
          <p className="text-sm text-muted-foreground">Sesiones de caja e ingresos/egresos.</p>
        </div>
        <DateRangeFilter defaultFrom={from} defaultTo={to} />
      </div>

      <Suspense key={`${from}-${to}`} fallback={<Skeleton className="h-96 rounded-xl" />}>
        <CajaContent from={from} to={to} />
      </Suspense>
    </div>
  );
}

async function CajaContent({ from, to }: { from: string; to: string }) {
  const [current, sessions] = await Promise.all([
    getCashCurrent(),
    getCashSessions({ from, to, limit: 30 }),
  ]);

  const totalIncome = sessions.data.reduce((a, s) => a + s.income_total, 0);
  const totalExpense = sessions.data.reduce((a, s) => a + s.expense_total, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Caja actual */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="size-5 shrink-0 text-primary" />
            <h2 className="font-display text-base font-bold text-foreground">Caja actual</h2>
          </div>
          {current.data && <Badge variant="success">Abierta</Badge>}
        </div>

        {!current.data ? (
          <Card className="rounded-[20px] p-5 shadow-sm">
            <EmptyState icon={Wallet} title="No hay una caja abierta en este momento" />
          </Card>
        ) : (
          <div className="flex min-w-0 flex-col gap-3">
            <StatCard
              label="Efectivo esperado"
              value={formatMoney(computeExpectedCash(current.data))}
              sub={`Apertura ${formatMoney(current.data.opening_amount)}`}
              icon={Wallet}
              accent="primary"
              variant="solid"
              valueClassName="text-4xl"
            />
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Ingresos"
                value={formatMoney(current.data.income_total)}
                icon={ArrowUpRight}
                accent="success"
                size="compact"
                iconSize="lg"
                valueClassName="text-2xl"
              />
              <StatCard
                label="Egresos"
                value={formatMoney(current.data.expense_total)}
                icon={ArrowDownRight}
                accent="destructive"
                size="compact"
                iconSize="lg"
                valueClassName="text-2xl"
              />
            </div>

            <Link
              href={`/caja/${current.data.id}`}
              className="flex items-center justify-between gap-3 rounded-[20px] border border-border/60 bg-card px-4 py-3.5 shadow-sm transition-all duration-200 hover:bg-secondary/30 hover:shadow-md active:scale-[0.99]"
            >
              <span className="font-display text-sm font-semibold text-primary">
                Ver detalle de la sesión
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </div>
        )}
      </div>

      {/* Resumen del periodo */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Ingresos totales"
            value={formatMoney(totalIncome)}
            icon={ArrowUpRight}
            accent="success"
            variant="solid"
            valueClassName="text-2xl"
          />
          <StatCard
            label="Egresos totales"
            value={formatMoney(totalExpense)}
            icon={ArrowDownRight}
            accent="destructive"
            variant="solid"
            valueClassName="text-2xl"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Sesiones en el periodo"
            value={String(sessions.data.length)}
            icon={Wallet}
            accent="primary"
            size="compact"
            iconSize="lg"
            valueClassName="text-2xl"
          />
          <StatCard
            label="Diferencia acumulada"
            value={formatMoney(sessions.data.reduce((a, s) => a + (s.difference_amount ?? 0), 0))}
            icon={Scale}
            accent="accent"
            size="compact"
            iconSize="lg"
            valueClassName="text-2xl"
          />
        </div>
      </div>

      <Card className="overflow-hidden rounded-[20px] p-0 shadow-sm">
        <div className="flex items-center gap-3 p-5 pb-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Wallet className="size-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-foreground">Historial de sesiones</h3>
            <p className="text-sm text-muted-foreground">Sesiones registradas en el periodo</p>
          </div>
        </div>
        <div className={sessions.data.length === 0 ? "px-5 pb-5" : "pb-2"}>
          <SessionsHistory sessions={sessions.data} />
        </div>
      </Card>
    </div>
  );
}

// ---------- Historial de sesiones — MF (Mobile First): tarjetas en mobile, tabla desde md ----------
function SessionsHistory({ sessions }: { sessions: CashSession[] }) {
  if (sessions.length === 0) {
    return <EmptyState icon={Wallet} title="Sin sesiones de caja en este periodo" />;
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {/* Mobile: tarjetas apiladas, cero scroll horizontal */}
      <div className="flex min-w-0 flex-col gap-3 px-5 pb-3 md:hidden">
        {sessions.map((session) => {
          const diff = session.difference_amount;
          const diffTone = diff === null ? "text-foreground" : diff < 0 ? "text-destructive" : "text-success";
          const diffLabel = diff === null ? "—" : `${diff > 0 ? "+ " : ""}${formatMoney(diff)}`;

          return (
            <Link
              key={session.id}
              href={`/caja/${session.id}`}
              className="min-w-0 rounded-[20px] border border-border/60 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.985] active:shadow-sm"
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <Badge variant={session.status === "open" ? "success" : "secondary"}>
                  {session.status === "open" ? "Abierta" : "Cerrada"}
                </Badge>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>

              <p className="mt-2 truncate text-xs text-muted-foreground">
                {formatShiftRange(session.opened_at, session.closed_at)}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Ingresos</p>
                  <p className="mt-0.5 truncate font-display text-lg font-extrabold text-success">
                    {formatMoney(session.income_total)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Egresos</p>
                  <p className="mt-0.5 truncate font-display text-lg font-extrabold text-destructive">
                    {formatMoney(session.expense_total)}
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t border-border/60 pt-3">
                <p className="text-[11px] text-muted-foreground">Balance del turno</p>
                <p className={cn("mt-0.5 truncate font-display text-lg font-extrabold", diffTone)}>
                  {diffLabel}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop: tabla completa */}
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead>Apertura</TableHead>
            <TableHead>Cierre</TableHead>
            <TableHead className="text-right">Ingresos</TableHead>
            <TableHead className="text-right">Egresos</TableHead>
            <TableHead className="text-right">Diferencia</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                <Badge variant={session.status === "open" ? "success" : "secondary"}>
                  {session.status === "open" ? "Abierta" : "Cerrada"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(session.opened_at)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(session.closed_at)}
              </TableCell>
              <TableCell className="text-right">{formatMoney(session.income_total)}</TableCell>
              <TableCell className="text-right">{formatMoney(session.expense_total)}</TableCell>
              <TableCell className="text-right">
                {session.difference_amount === null ? "—" : formatMoney(session.difference_amount)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/caja/${session.id}`}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Ver <ChevronRight className="size-3.5" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
