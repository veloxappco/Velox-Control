import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/server";
import { getOrder } from "@/lib/api/queries";

// Detalle de un pedido (con productos) para el cliente (el token vive en cookie httpOnly,
// por eso el navegador no puede llamar a la API directamente).
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: "Id inválido" }, { status: 400 });
  try {
    return NextResponse.json(await getOrder(id));
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ message: e.message, code: e.code }, { status: e.status });
    }
    return NextResponse.json({ message: "Error inesperado" }, { status: 500 });
  }
}
