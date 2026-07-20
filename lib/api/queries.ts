import "server-only";
import { apiFetch } from "./server";
import { ENDPOINTS } from "./config";
import type {
  DashboardSummary,
  DateRangeParams,
  MeResponse,
  OrdersSummary,
  OrdersListResponse,
  InventoryAlertsResponse,
  IngredientConsumptionResponse,
  CashCurrentResponse,
  CashSessionsResponse,
  CashSessionDetailResponse,
  CashExpenseCategoryBreakdown,
  ExpenseMovement,
  ExpensesReport,
  ReportsSalesResponse,
  ReportsPaymentMethodsResponse,
  ReportsTopProductsResponse,
  ReportsHourlySalesResponse,
  ReportsProfitResponse,
} from "./types";

// ---------- Auth ----------
export const getMe = () => apiFetch<MeResponse>(ENDPOINTS.auth.me);

// ---------- Dashboard ----------
export const getDashboardSummary = (params: DateRangeParams) =>
  apiFetch<DashboardSummary>(ENDPOINTS.dashboard.summary, { params });

// ---------- Orders ----------
export const getOrdersSummary = (params: DateRangeParams) =>
  apiFetch<OrdersSummary>(ENDPOINTS.orders.summary, { params });

export const getOrdersRecent = (params: DateRangeParams) =>
  apiFetch<OrdersListResponse>(ENDPOINTS.orders.recent, { params });

export const getOrdersPending = (params: DateRangeParams) =>
  apiFetch<OrdersListResponse>(ENDPOINTS.orders.pending, { params });

// ---------- Inventory ----------
export const getInventoryAlerts = (params: DateRangeParams) =>
  apiFetch<InventoryAlertsResponse>(ENDPOINTS.inventory.alerts, { params });

export const getIngredientConsumption = (params: DateRangeParams) =>
  apiFetch<IngredientConsumptionResponse>(ENDPOINTS.inventory.ingredientConsumption, {
    params,
  });

// ---------- Cash ----------
export const getCashCurrent = () => apiFetch<CashCurrentResponse>(ENDPOINTS.cash.current);

export const getCashSessions = (params: DateRangeParams) =>
  apiFetch<CashSessionsResponse>(ENDPOINTS.cash.sessions, { params });

export const getCashSessionDetail = (id: number | string) =>
  apiFetch<CashSessionDetailResponse>(ENDPOINTS.cash.sessionDetail(id));

// ---------- Egresos ----------
// La API no tiene un endpoint que liste egresos sueltos por fecha, así que
// lo armamos: 1) traemos las sesiones de caja del rango, 2) para las que
// tuvieron egresos, pedimos su detalle (que sí trae cada movimiento con
// categoría y descripción), 3) combinamos todo y calculamos el desglose
// por categoría nosotros mismos, a partir de los movimientos reales.
export async function getExpensesReport({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<ExpensesReport> {
  const sessions = await getCashSessions({ from, to, limit: 90 });
  const sessionsWithExpenses = sessions.data.filter((s) => s.expense_total > 0);

  const details = await Promise.all(
    sessionsWithExpenses.map((s) => getCashSessionDetail(s.id))
  );

  const movements: ExpenseMovement[] = details.flatMap((detail) =>
    (detail.data.movements ?? [])
      .filter((m) => m.type === "expense")
      .map((m) => ({ ...m, session_id: detail.data.id }))
  );

  movements.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const categoryTotals = new Map<string, { count: number; total: number }>();
  for (const m of movements) {
    const key = m.category?.trim() || "Sin categoría";
    const entry = categoryTotals.get(key) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += m.amount;
    categoryTotals.set(key, entry);
  }

  const categories: CashExpenseCategoryBreakdown[] = Array.from(categoryTotals.entries())
    .map(([category, v]) => ({ category, count: v.count, total: v.total }))
    .sort((a, b) => b.total - a.total);

  return {
    period: { from, to, timezone: sessions.period.timezone },
    total: movements.reduce((acc, m) => acc + m.amount, 0),
    count: movements.length,
    categories,
    movements,
  };
}

// ---------- Reports ----------
export const getReportsSales = (params: DateRangeParams) =>
  apiFetch<ReportsSalesResponse>(ENDPOINTS.reports.sales, { params });

export const getReportsPaymentMethods = (params: DateRangeParams) =>
  apiFetch<ReportsPaymentMethodsResponse>(ENDPOINTS.reports.paymentMethods, { params });

export const getReportsTopProducts = (
  params: DateRangeParams & { categoria_id?: number; producto_id?: number }
) =>
  apiFetch<ReportsTopProductsResponse>(ENDPOINTS.reports.topProducts, {
    params: {
      fecha_inicio: params.from,
      fecha_fin: params.to,
      limit: params.limit,
      categoria_id: params.categoria_id,
      producto_id: params.producto_id,
    },
  });

export const getReportsHourlySales = (params: DateRangeParams) =>
  apiFetch<ReportsHourlySalesResponse>(ENDPOINTS.reports.hourlySales, { params });

export const getReportsProfit = (params: DateRangeParams) =>
  apiFetch<ReportsProfitResponse>(ENDPOINTS.reports.profit, { params });
