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

/** "19 jul · 08:21 AM – 05:55 PM" — para tarjetas compactas (historial de
 * turnos de caja), donde no cabe repetir el día completo en cada extremo. */
export function formatShiftRange(openedAt: string, closedAt: string | null) {
  const dayLabel = new Intl.DateTimeFormat("es-CO", {
    timeZone: DEFAULT_TIMEZONE,
    day: "2-digit",
    month: "short",
  }).format(new Date(openedAt));

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const openTime = timeFormatter.format(new Date(openedAt));
  const closeTime = closedAt ? timeFormatter.format(new Date(closedAt)) : "en curso";

  return `${dayLabel} · ${openTime} – ${closeTime}`;
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

/** Fecha (YYYY-MM-DD) de un timestamp ISO, en la zona horaria del negocio.
 * Útil para filtrar listas que la API no deja filtrar por fecha (p. ej.
 * /orders/recent) comparando contra el rango elegido en el filtro. */
export function isoDateOnly(value: string, timeZone: string = DEFAULT_TIMEZONE) {
  return dateInTimeZone(new Date(value), timeZone);
}

/**
 * Convierte un string "YYYY-MM-DD" (sin hora, como el que devuelven los
 * reportes por día) en un Date de medianoche LOCAL.
 *
 * Ojo: `new Date("2026-07-19")` NO sirve para esto — por spec de JS, una
 * fecha sin hora siempre se interpreta como medianoche UTC. Al formatearla
 * después en un navegador con zona horaria detrás de UTC (como Bogotá,
 * UTC-5), el día se corre uno hacia atrás (19 se muestra como 18). Por eso
 * acá se arma el Date a mano con los componentes locales.
 */
export function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
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

// El negocio maneja 5 estados de pedido nada más. Agrupamos los estados
// finos que puede devolver la API (accepted, confirmed, on_the_way, etc.)
// en estos 5 baldes para que la interfaz sea simple y consistente.
export const ORDER_STATUS_GROUPS = [
  "Pendiente",
  "En Preparación",
  "Listo",
  "Entregado",
  "Cancelado",
] as const;

export type OrderStatusGroup = (typeof ORDER_STATUS_GROUPS)[number];

const ORDER_STATUS_TO_GROUP: Record<string, OrderStatusGroup> = {
  pending: "Pendiente",
  accepted: "Pendiente",
  confirmed: "Pendiente",
  preparing: "En Preparación",
  ready: "Listo",
  on_the_way: "Listo",
  completed: "Entregado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  canceled: "Cancelado",
};

export function orderStatusLabel(status: string): OrderStatusGroup {
  return ORDER_STATUS_TO_GROUP[status] ?? "Pendiente";
}

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "accent"
  | "outline";

// Un color consistente por estado en toda la app: Pendiente=azul,
// En Preparación=naranja, Listo=verde, Entregado=morado, Cancelado=rojo.
export function orderStatusVariant(status: string): BadgeVariant {
  switch (orderStatusLabel(status)) {
    case "Pendiente":
      return "accent";
    case "En Preparación":
      return "warning";
    case "Listo":
      return "success";
    case "Entregado":
      return "default";
    case "Cancelado":
      return "destructive";
  }
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
  bank_transfer: "Transferencia",
  other: "Otro",
};

export function paymentMethodLabel(method: string) {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

/** Color del badge según el método de pago — un tono distinto por método
 * para diferenciarlos de un vistazo: Efectivo azul, Transferencia verde,
 * Tarjeta violeta, Nequi naranja, Daviplata rojo, Otro gris. */
const PAYMENT_METHOD_BADGE_VARIANTS: Record<
  string,
  "accent" | "success" | "default" | "warning" | "destructive" | "secondary"
> = {
  cash: "accent",
  transfer: "success",
  bank_transfer: "success",
  card: "default",
  nequi: "warning",
  daviplata: "destructive",
  other: "secondary",
};

export function paymentMethodBadgeVariant(method: string) {
  return PAYMENT_METHOD_BADGE_VARIANTS[method] ?? "secondary";
}

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  delivery: "Domicilio",
  pickup: "Recoger en tienda",
  dine_in: "En el local",
};

export function deliveryTypeLabel(type: string | null | undefined) {
  if (!type) return "—";
  return DELIVERY_TYPE_LABELS[type] ?? toTitleCase(type);
}
