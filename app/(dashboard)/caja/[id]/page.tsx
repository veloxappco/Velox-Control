import Link from "next/link";
import { ArrowLeft, Calculator, CreditCard, Tag } from "lucide-react";
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
import { EmptyState } from "@/components/shared/empty-state";
import { CashMovementsList } from "@/components/dashboard/cash-movements-list";
import { CashReconciliation } from "@/components/dashboard/cash-reconciliation";
import { getCashSessionDetail } from "@/lib/api/queries";
import { formatDateTime, formatMoney, paymentMethodLabel } from "@/lib/format";

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Apertura" value={formatMoney(session.opening_amount)} />
        <Metric label="Ingresos totales" value={formatMoney(session.income_total)} tone="success" />
        <Metric label="Egresos totales" value={formatMoney(session.expense_total)} tone="destructive" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="size-4" /> Cuadre de caja (efectivo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CashReconciliation session={session} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-4" /> Por método de pago
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {session.payment_methods.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={CreditCard} title="Sin movimientos por método de pago" />
              </div>
            ) : (
              <Table>
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="size-4" /> Egresos por categoría
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {session.expense_categories.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={Tag} title="Sin egresos registrados" />
              </div>
            ) : (
              <Table>
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
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos</CardTitle>
        </CardHeader>
        <CardContent
          className={!session.movements || session.movements.length === 0 ? undefined : "p-0"}
        >
          <CashMovementsList movements={session.movements ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive";
}) {
  const toneClass = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-lg font-black ${toneClass}`}>{value}</p>
    </Card>
  );
}
