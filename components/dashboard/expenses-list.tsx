"use client";

import { useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatDateTime, formatMoney, paymentMethodLabel } from "@/lib/format";
import type { ExpenseMovement } from "@/lib/api/types";

function categoryOf(m: ExpenseMovement) {
  return m.category?.trim() || "Sin categoría";
}

export function ExpensesList({ movements }: { movements: ExpenseMovement[] }) {
  const categories = useMemo(() => {
    const set = new Set(movements.map(categoryOf));
    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [movements]);

  const [selected, setSelected] = useState("Todas");

  const filtered = useMemo(() => {
    if (selected === "Todas") return movements;
    return movements.filter((m) => categoryOf(m) === selected);
  }, [movements, selected]);

  if (movements.length === 0) {
    return <EmptyState icon={Receipt} title="Sin egresos en este periodo" />;
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelected(cat)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              selected === cat
                ? "border-transparent bg-gradient-brand text-white shadow"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Receipt} title="Sin egresos en esta categoría" />
      ) : (
        <>
          {/* Mobile: lista de cards apiladas — cero scroll horizontal */}
          <div className="flex flex-col gap-2 md:hidden">
            {filtered.map((m) => (
              <Card key={m.id} className="min-w-0 p-3.5">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {m.description?.trim() || "Sin descripción"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {formatDateTime(m.created_at)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-destructive">
                    -{formatMoney(m.amount)}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">{categoryOf(m)}</Badge>
                  {m.payment_method && (
                    <Badge variant="outline">{paymentMethodLabel(m.payment_method)}</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop: tabla completa */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="max-w-[280px] truncate font-medium">
                        {m.description?.trim() || "Sin descripción"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{categoryOf(m)}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.payment_method ? paymentMethodLabel(m.payment_method) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        -{formatMoney(m.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(m.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
