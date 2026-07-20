const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-CO");

export function formatMoney(value: number) {
  return currencyFormatter.format(value ?? 0);
}

export function formatNumber(value: number) {
  return numberFormatter.format(value ?? 0);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Listo",
  on_the_way: "En camino",
  completed: "Completado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  canceled: "Cancelado",
  unknown: "Sin estado",
};

export function orderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

export function orderStatusVariant(status: string): BadgeVariant {
  if (["completed", "delivered"].includes(status)) return "success";
  if (["cancelled", "canceled"].includes(status)) return "destructive";
  if (["pending"].includes(status)) return "warning";
  if (["accepted", "confirmed", "preparing", "ready", "on_the_way"].includes(status))
    return "default";
  return "outline";
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  nequi: "Nequi",
  daviplata: "Daviplata",
  transfer: "Transferencia",
  other: "Otro",
};

export function paymentMethodLabel(method: string) {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}
