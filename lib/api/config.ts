// Configuración central de la API de Velox.
// Si las rutas reales en routes/api.php son distintas, este es el único
// archivo que hay que tocar — todo el resto del proyecto usa estas constantes.

export const API_BASE_URL =
  process.env.VELOX_API_BASE_URL ?? "http://localhost:8000/api/admin";

export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  dashboard: {
    summary: "/dashboard/summary",
  },
  orders: {
    summary: "/orders/summary",
    recent: "/orders/recent",
    pending: "/orders/pending",
  },
  inventory: {
    alerts: "/inventory/alerts",
    ingredientConsumption: "/inventory/ingredient-consumption",
  },
  cash: {
    current: "/cash/current",
    sessions: "/cash/sessions",
    sessionDetail: (id: number | string) => `/cash/sessions/${id}`,
  },
  reports: {
    sales: "/reports/sales",
    paymentMethods: "/reports/payment-methods",
    topProducts: "/reports/top-products",
    hourlySales: "/reports/hourly-sales",
    profit: "/reports/profit",
  },
} as const;
