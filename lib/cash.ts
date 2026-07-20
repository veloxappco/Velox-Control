import type { CashSession } from "@/lib/api/types";

/**
 * Efectivo Esperado — cuánto dinero físico debería haber en la caja, no el
 * total general de la sesión (que mezcla tarjeta, transferencia, etc.):
 *
 *   Base inicial + Ingresos en efectivo (Venta POS + Pedidos) - Egresos en efectivo
 *
 * El desglose por método de pago (`payment_methods`) ya viene separado por
 * la API, así que solo se toma la fila "cash" de ahí.
 */
export function computeExpectedCash(session: CashSession): number {
  const cash = session.payment_methods.find((m) => m.payment_method === "cash");
  const cashIncome = cash?.income_total ?? 0;
  const cashExpense = cash?.expense_total ?? 0;
  return session.opening_amount + cashIncome - cashExpense;
}
