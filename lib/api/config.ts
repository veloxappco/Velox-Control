// Configuración central de la API de VeloxAdmin.
// Basado en el `route:list` real de Laravel (grupo Api\Admin\*).
// Si algo cambia en routes/api.php, este es el único archivo que hay que tocar.

export const API_BASE_URL =
  process.env.VELOX_API_BASE_URL ?? "https://veloxpedidos.co/api/v1/admin";

export const ENDPOINTS = {
  auth: {
    login: "/login",
    me: "/me",
    logout: "/logout",
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
    // Ruta real: top-consumed-ingredients (antes asumida como ingredient-consumption)
    ingredientConsumption: "/inventory/top-consumed-ingredients",
  },
  cash: {
    current: "/cash/current",
    sessions: "/cash/sessions",
    // Ruta real: /cash/sessions/{sessionId}/summary
    sessionDetail: (id: number | string) => `/cash/sessions/${id}/summary`,
  },
  reports: {
    sales: "/reports/sales",
    paymentMethods: "/reports/payment-methods",
    topProducts: "/reports/top-products",
    hourlySales: "/reports/hourly-sales",
    profit: "/reports/profit",
  },
} as const;
