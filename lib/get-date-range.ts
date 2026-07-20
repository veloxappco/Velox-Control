import "server-only";
import { cookies } from "next/headers";
import { DATE_RANGE_COOKIE, decodeDateRange } from "@/lib/date-range-cookie";

/**
 * Resuelve el rango de fechas que debe usar una página, con esta prioridad:
 *   1. Los query params de la URL (?from=...&to=...) — p. ej. si se comparte
 *      un link con fechas específicas.
 *   2. La cookie con el último rango elegido por el usuario en CUALQUIER
 *      módulo — así el filtro "queda puesto" al cambiar de pantalla.
 *   3. El rango por defecto propio de esa página (fallback).
 */
export async function resolveDateRange(
  params: { from?: string; to?: string },
  fallback: { from: string; to: string }
): Promise<{ from: string; to: string }> {
  if (params.from && params.to) {
    return { from: params.from, to: params.to };
  }

  const store = await cookies();
  const stored = decodeDateRange(store.get(DATE_RANGE_COOKIE)?.value);

  return {
    from: params.from ?? stored.from ?? fallback.from,
    to: params.to ?? stored.to ?? fallback.to,
  };
}
