import type { CashSession } from "@/lib/api/types";

/**
 * Desglose del "cuadre de caja": la caja física solo se mueve con Efectivo
 * (tarjeta, Nequi, transferencia, etc. no pasan por el cajón), así que todo
 * acá se calcula filtrando `payment_methods` a la fila "cash" únicamente —
 * nunca se suma Transferencia ni otros métodos.
 *
 *   Esperado = Base inicial + Ingresos en efectivo (Venta POS + Pedidos)
 *              - Egresos en efectivo
 */
export function getCashBreakdown(session: CashSession) {
  const cash = session.payment_methods.find((m) => m.payment_method === "cash");
  const income = cash?.income_total ?? 0;
  const expense = cash?.expense_total ?? 0;
  const expected = session.opening_amount + income - expense;
  const diff = session.closing_amount !== null ? session.closing_amount - expected : null;

  return { income, expense, expected, diff };
}

/** Solo el "Efectivo esperado" (ver getCashBreakdown para el detalle completo). */
export function computeExpectedCash(session: CashSession): number {
  return getCashBreakdown(session).expected;
}
