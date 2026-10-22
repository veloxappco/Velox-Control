import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api/server";

// Elimina productos de un pedido o venta POS. Solo el administrador (token de
// la sesión) puede hacerlo; el backend valida permisos, caja, stock, etc.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    kind?: string;
    id?: number;
    item_ids?: number[];
    all?: boolean;
    reason?: string;
  } | null;

  const id = Number(body?.id);
  const reason = (body?.reason ?? "").trim();
  const all = body?.all === true;
  const itemIds = Array.isArray(body?.item_ids) ? body!.item_ids!.map(Number).filter(Number.isInteger) : [];

  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ message: "Id inválido" }, { status: 400 });
  if (body?.kind !== "pos-sale" && body?.kind !== "order") {
    return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });
  }
  if (!reason) return NextResponse.json({ message: "El motivo es obligatorio." }, { status: 422 });
  if (!all && itemIds.length === 0) {
    return NextResponse.json({ message: "Selecciona al menos un producto." }, { status: 422 });
  }

  const path = body.kind === "pos-sale" ? `/pos-sales/${id}/items/remove` : `/orders/${id}/items/remove`;

  try {
    const data = await apiFetch<unknown>(path, {
      method: "POST",
      body: JSON.stringify({ item_ids: all ? [] : itemIds, all, reason }),
    });
    return NextResponse.json(data ?? { ok: true });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ message: e.message, code: e.code }, { status: e.status });
    }
    return NextResponse.json({ message: "Error inesperado" }, { status: 500 });
  }
}
