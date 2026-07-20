"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronDown } from "lucide-react";
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
import { formatDateTime, formatMoney, paymentMethodLabel } from "@/lib/format";
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
      <div className="flex min-w-0 flex-col gap-2 md:hidden">
        {visible.map((m) => (
          <div
            key={m.id}
            className="min-w-0 rounded-xl border border-border bg-card p-3.5 shadow-sm"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              {m.type === "income" ? (
                <span className="flex items-center gap-1 text-sm font-medium text-success">
                  <ArrowUpRight className="size-3.5" /> Ingreso
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm font-medium text-destructive">
                  <ArrowDownRight className="size-3.5" /> Egreso
                </span>
              )}
              <span className="shrink-0 text-sm font-semibold">{formatMoney(m.amount)}</span>
            </div>
            <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="truncate">{m.category ?? "—"}</span>
              <span>·</span>
              <span>{m.payment_method ? paymentMethodLabel(m.payment_method) : "—"}</span>
            </div>
            {m.description && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{m.description}</p>
            )}
            <p className="mt-1 text-[11px] text-muted-foreground">{formatDateTime(m.created_at)}</p>
          </div>
        ))}
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
              <TableCell className="text-right font-medium">{formatMoney(m.amount)}</TableCell>
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
          className="mt-1 self-center"
        >
          <ChevronDown className="size-4" />
          Cargar {Math.min(PAGE_SIZE, remaining)} más ({remaining} restantes)
        </Button>
      )}
    </div>
  );
}
