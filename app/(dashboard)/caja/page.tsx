import { Suspense } from "react";
import Link from "next/link";
import { Wallet, ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";
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
import { StatCard } from "@/components/dashboard/stat-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getCashCurrent, getCashSessions } from "@/lib/api/queries";
import { daysAgoISO, formatDateTime, formatMoney, todayISO } from "@/lib/format";
import { resolveDateRange } from "@/lib/get-date-range";

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

  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-brand opacity-[0.06]" />
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="size-4" /> Caja actual
          </CardTitle>
          {current.data && (
            <Badge variant="success">Abierta</Badge>
          )}
        </CardHeader>
        <CardContent>
          {!current.data ? (
            <EmptyState icon={Wallet} title="No hay una caja abierta en este momento" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MiniStat label="Apertura" value={formatMoney(current.data.opening_amount)} />
              <MiniStat
                label="Ingresos"
                value={formatMoney(current.data.income_total)}
                icon={ArrowUpRight}
                tone="success"
              />
              <MiniStat
                label="Egresos"
                value={formatMoney(current.data.expense_total)}
                icon={ArrowDownRight}
                tone="destructive"
              />
              <MiniStat label="Esperado" value={formatMoney(current.data.expected_amount)} />
            </div>
          )}
        </CardContent>
        {current.data && (
          <div className="border-t border-border/60 px-5 py-3">
            <Link
              href={`/caja/${current.data.id}`}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver detalle de la sesión <ChevronRight className="size-4" />
            </Link>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sesiones en el periodo"
          value={String(sessions.data.length)}
          icon={Wallet}
        />
        <StatCard
          label="Ingresos totales"
          value={formatMoney(sessions.data.reduce((a, s) => a + s.income_total, 0))}
          icon={ArrowUpRight}
          accent="success"
        />
        <StatCard
          label="Egresos totales"
          value={formatMoney(sessions.data.reduce((a, s) => a + s.expense_total, 0))}
          icon={ArrowDownRight}
          accent="destructive"
        />
        <StatCard
          label="Diferencia acumulada"
          value={formatMoney(
            sessions.data.reduce((a, s) => a + (s.difference_amount ?? 0), 0)
          )}
          icon={Wallet}
          accent="accent"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de sesiones</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sessions.data.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Wallet} title="Sin sesiones de caja en este periodo" />
            </div>
          ) : (
            <Table>
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
                {sessions.data.map((session) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  tone?: "success" | "destructive";
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 flex items-center gap-1 text-lg font-semibold ${toneClass}`}>
        {Icon && <Icon className="size-4" />}
        {value}
      </p>
    </div>
  );
}
