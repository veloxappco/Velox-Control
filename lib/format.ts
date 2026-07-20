// Zona horaria del negocio. La API (Laravel, config('app.timezone')) también
// usa America/Bogota por defecto — hay que fijarla explícitamente acá porque
// el servidor de Vercel corre en UTC, y calcular "hoy" con la hora del
// servidor hace que después de las 7pm (hora Colombia) se le pida a la API
// datos de un día que, en Bogotá, todavía no llega (dashboard vacío).
const DEFAULT_TIMEZONE = "America/Bogota";

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
      timeZone: DEFAULT_TIMEZONE,
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
      timeZone: DEFAULT_TIMEZONE,
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

/** Fecha (YYYY-MM-DD) de "hoy" en la zona horaria del negocio, sin importar
 * en qué timezone esté corriendo el servidor o el navegador. */
export function todayISO(timeZone: string = DEFAULT_TIMEZONE) {
  return dateInTimeZone(new Date(), timeZone);
}

export function daysAgoISO(days: number, timeZone: string = DEFAULT_TIMEZONE) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return dateInTimeZone(d, timeZone);
}

function dateInTimeZone(date: Date, timeZone: string) {
  // en-CA formatea como YYYY-MM-DD, exactamente lo que espera la API.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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

// Palabras que en español van en minúscula dentro de un título, salvo que
// sean la primera palabra (p. ej. "Leche de Tina", no "Leche De Tina").
const TITLE_CASE_MINOR_WORDS = new Set([
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "y",
  "o",
  "en",
  "a",
  "al",
  "con",
  "sin",
  "por",
  "para",
  "un",
  "una",
]);

/** "LECHE DE TINA" / "leche de tina" -> "Leche de Tina" */
export function toTitleCase(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && TITLE_CASE_MINOR_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
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
