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
