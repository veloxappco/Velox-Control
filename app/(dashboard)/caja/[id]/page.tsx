import Link from "next/link";
import { ArrowLeft, Calculator, CreditCard, Tag, Wallet } from "lucide-react";
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
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { CashMovementsList } from "@/components/dashboard/cash-movements-list";
import { CashReconciliation } from "@/components/dashboard/cash-reconciliation";
import { getCashSessionDetail } from "@/lib/api/queries";
import { formatDateTime, formatMoney, paymentMethodLabel } from "@/lib/format";
import { computeExpectedCash } from "@/lib/cash";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CajaSessionPage({ params }: PageProps) {
  const { id } = await params;
  const { data: session } = await getCashSessionDetail(id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/caja"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver a caja
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Sesión #{session.id}</h1>
          <Badge variant={session.status === "open" ? "success" : "secondary"}>
            {session.status === "open" ? "Abierta" : "Cerrada"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Abierta {formatDateTime(session.opened_at)}
          {session.closed_at ? ` · Cerrada ${formatDateTime(session.closed_at)}` : ""}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <StatCard
          label="Efectivo esperado"
          value={formatMoney(computeExpectedCash(session))}
          sub={`Apertura ${formatMoney(session.opening_amount)}`}
          icon={Wallet}
          accent="primary"
          variant="solid"
          valueClassName="text-4xl"
        />
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Ingresos totales"
            value={formatMoney(session.income_total)}
            accent="success"
            variant="solid"
            size="compact"
            valueClassName="text-2xl"
          />
          <StatCard
            label="Egresos totales"
            value={formatMoney(session.expense_total)}
            accent="warning"
            variant="solid"
            size="compact"
            valueClassName="text-2xl"
          />
        </div>
      </div>

      <Card className="rounded-[20px] p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Calculator className="size-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-foreground">Cuadre de caja</h3>
            <p className="text-sm text-muted-foreground">Solo movimientos en efectivo</p>
          </div>
        </div>
        <div className="mt-5">
          <CashReconciliation session={session} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-[20px] p-0 shadow-sm">
          <div className="flex items-center gap-3 p-5 pb-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
              <CreditCard className="size-6 text-accent" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold text-foreground">Por método de pago</h3>
              <p className="text-sm text-muted-foreground">Ingresos y egresos por método</p>
            </div>
          </div>

          {session.payment_methods.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState icon={CreditCard} title="Sin movimientos por método de pago" />
            </div>
          ) : (
            <>
              {/* Mobile: tarjetas, cero scroll horizontal */}
              <div className="flex min-w-0 flex-col gap-3 px-5 pb-5 md:hidden">
                {session.payment_methods.map((m) => (
                  <div
                    key={m.payment_method}
                    className="rounded-[20px] border border-border/60 bg-card p-4 shadow-sm"
                  >
                    <p className="font-display text-base font-semibold text-foreground">
                      {paymentMethodLabel(m.payment_method)}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">Ingresos</p>
                        <p className="mt-0.5 truncate font-display text-sm font-bold text-success">
                          {formatMoney(m.income_total)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">Egresos</p>
                        <p className="mt-0.5 truncate font-display text-sm font-bold text-destructive">
                          {formatMoney(m.expense_total)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">Neto</p>
                        <p className="mt-0.5 truncate font-display text-sm font-bold text-foreground">
                          {formatMoney(m.net_total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: tabla completa */}
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                    <TableHead className="text-right">Egresos</TableHead>
                    <TableHead className="text-right">Neto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {session.payment_methods.map((m) => (
                    <TableRow key={m.payment_method}>
                      <TableCell className="font-medium">
                        {paymentMethodLabel(m.payment_method)}
                      </TableCell>
                      <TableCell className="text-right">{formatMoney(m.income_total)}</TableCell>
                      <TableCell className="text-right">{formatMoney(m.expense_total)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMoney(m.net_total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </Card>

        <Card className="overflow-hidden rounded-[20px] p-0 shadow-sm">
          <div className="flex items-center gap-3 p-5 pb-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-warning/10">
              <Tag className="size-6 text-warning" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold text-foreground">Egresos por categoría</h3>
              <p className="text-sm text-muted-foreground">Distribución del gasto en la sesión</p>
            </div>
          </div>

          {session.expense_categories.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState icon={Tag} title="Sin egresos registrados" />
            </div>
          ) : (
            <>
              {/* Mobile: tarjetas con barra de distribución, cero scroll horizontal */}
              <div className="flex min-w-0 flex-col gap-3 px-5 pb-5 md:hidden">
                {session.expense_categories.map((c) => {
                  const pct =
                    session.expense_total > 0 ? Math.round((c.total / session.expense_total) * 100) : 0;
                  return (
                    <div
                      key={c.category}
                      className="rounded-[20px] border border-border/60 bg-card p-4 shadow-sm"
                    >
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <span className="min-w-0 truncate font-display text-base font-semibold text-foreground">
                          {c.category}{" "}
                          <span className="font-display text-sm font-medium text-muted-foreground">
                            ({c.count})
                          </span>
                        </span>
                        <span className="shrink-0 font-display text-base font-bold text-foreground">
                          {formatMoney(c.total)}
                        </span>
                      </div>
                      <div className="mt-2.5 flex min-w-0 items-center gap-2.5">
                        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-success transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-9 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: tabla completa */}
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Movimientos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {session.expense_categories.map((c) => (
                    <TableRow key={c.category}>
                      <TableCell className="font-medium">{c.category}</TableCell>
                      <TableCell className="text-right">{c.count}</TableCell>
                      <TableCell className="text-right font-medium">{formatMoney(c.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden rounded-[20px] p-0 shadow-sm">
        <div className="flex items-center gap-3 p-5 pb-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary">
            <Wallet className="size-6 text-foreground/70" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-foreground">Movimientos</h3>
            <p className="text-sm text-muted-foreground">Todos los movimientos de la sesión</p>
          </div>
        </div>
        <div
          className={!session.movements || session.movements.length === 0 ? "px-5 pb-5" : "pb-2"}
        >
          <CashMovementsList movements={session.movements ?? []} />
        </div>
      </Card>
    </div>
  );
}
