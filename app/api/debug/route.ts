import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api/server";

// HERRAMIENTA TEMPORAL de inspección (solo lectura).
// Sirve para ver el JSON real de los endpoints nuevos usando la sesión de
// admin abierta (el token vive en una cookie httpOnly, así que no se puede
// leer desde la consola del navegador).
//
// Uso (con sesión iniciada y ENABLE_API_DEBUG=1 en el entorno):
//   /api/debug?path=/pos-sales&from=2026-10-01&to=2026-10-21
//   /api/debug?path=/pos-sales/123
//   /api/debug?path=/orders/456
//   /api/debug?path=/item-removal-logs
//
// Solo GET y solo rutas permitidas. NO ejecuta eliminaciones.
// BORRAR este archivo cuando termine la integración.
const ALLOWED = [/^\/orders\/recent$/, /^\/pos-sales(\/\d+)?$/, /^\/orders\/\d+$/, /^\/item-removal-logs$/];

export async function GET(request: NextRequest) {
  if (process.env.ENABLE_API_DEBUG !== "1") {
    return NextResponse.json({ message: "Deshabilitado" }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const path = searchParams.get("path") ?? "";
  if (!ALLOWED.some((re) => re.test(path))) {
    return NextResponse.json({ message: "Ruta no permitida", allowed: ALLOWED.map(String) }, { status: 400 });
  }

  const params: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    if (k !== "path") params[k] = v;
  });

  try {
    const data = await apiFetch<unknown>(path, { params });
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ error: e.message, status: e.status, code: e.code }, { status: e.status });
    }
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
