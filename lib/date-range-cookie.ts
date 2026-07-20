// Cookie que recuerda el último rango de fechas elegido por el usuario, sin
// importar en qué módulo lo haya elegido (Dashboard, Ingresos, Egresos...).
// Este archivo es "isomorfo" (se puede importar tanto desde componentes de
// cliente como de servidor) porque NO usa `next/headers` — para leerla desde
// el servidor, ver `lib/get-date-range.ts`.

export const DATE_RANGE_COOKIE = "velox_date_range";

// Cuánto dura la cookie en el navegador antes de olvidarse el filtro.
const COOKIE_MAX_AGE_DAYS = 180;

/** "2026-07-01" + "2026-07-20" -> "2026-07-01|2026-07-20" */
export function encodeDateRange(from: string, to: string) {
  return `${from}|${to}`;
}

/** "2026-07-01|2026-07-20" -> { from: "2026-07-01", to: "2026-07-20" } */
export function decodeDateRange(value: string | undefined | null): {
  from?: string;
  to?: string;
} {
  if (!value) return {};
  const [from, to] = value.split("|");
  if (!from || !to) return {};
  return { from, to };
}

/**
 * Guarda el rango elegido en una cookie del navegador. Se llama desde el
 * DateRangeFilter (componente de cliente) cada vez que el usuario cambia el
 * filtro, para que al entrar a otro módulo la página lo lea como su valor
 * por defecto en vez de volver a "hoy".
 */
export function persistDateRange(from: string, to: string) {
  if (typeof document === "undefined") return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${DATE_RANGE_COOKIE}=${encodeDateRange(from, to)}; path=/; max-age=${maxAge}; samesite=lax`;
}
