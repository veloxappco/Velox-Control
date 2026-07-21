"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { formatDateTime, formatMoney, paymentMethodBadgeVariant, paymentMethodLabel } from "@/lib/format";
import type { CashMovement } from "@/lib/api/types";

const PAGE_SIZE = 10;

export function CashMovementsList({ movements }: { movements: CashMovement[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (movements.length === 0) {
    return <EmptyState icon={ArrowUpRight} title="Sin movimientos registrados" />;
  }

  const visible = movements.slice(0, visibleCount);
  const hasMore = visibleCount < movements.length;
  const remaining = movements.length - visibleCount;

  return (
    <div className="flex min-w-0 flex-col gap-3 p-5 md:px-0 md:pb-4 md:pt-0">
      {/* Mobile: tarjetas apiladas, cero scroll horizontal */}
      <div className="flex min-w-0 flex-col gap-3 md:hidden">
        {visible.map((m) => {
          const isIncome = m.type === "income";
          return (
            <div
              key={m.id}
              className="flex min-w-0 items-center gap-3 rounded-[20px] border border-border/60 bg-card p-4 shadow-sm"
            >
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full",
                  isIncome ? "bg-success/10" : "bg-destructive/10"
                )}
              >
                {isIncome ? (
                  <ArrowUpRight className="size-5 text-success" />
                ) : (
                  <ArrowDownRight className="size-5 text-destructive" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-semibold text-foreground">
                  {m.category ?? (isIncome ? "Ingreso" : "Egreso")}
                </p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {m.description?.trim() || formatDateTime(m.created_at)}
                </p>
                {m.description?.trim() && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {formatDateTime(m.created_at)}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span
                  className={cn(
                    "font-display text-base font-bold",
                    isIncome ? "text-success" : "text-destructive"
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {formatMoney(m.amount)}
                </span>
                {m.payment_method && (
                  <Badge variant={paymentMethodBadgeVariant(m.payment_method)} className="text-[13px]">
                    {paymentMethodLabel(m.payment_method)}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: tabla completa */}
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Método</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                {m.type === "income" ? (
                  <span className="flex items-center gap-1 text-success">
                    <ArrowUpRight className="size-3.5" /> Ingreso
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-destructive">
                    <ArrowDownRight className="size-3.5" /> Egreso
                  </span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{m.category ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{m.description ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {m.payment_method ? paymentMethodLabel(m.payment_method) : "—"}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {m.type === "income" ? "+" : "-"}
                {formatMoney(m.amount)}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(m.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hasMore && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-1 self-center rounded-full"
        >
          <ChevronDown className="size-4" />
          Cargar {Math.min(PAGE_SIZE, remaining)} más ({remaining} restantes)
        </Button>
      )}
    </div>
  );
}
