import { NextRequest, NextResponse } from "next/server";
import {
  getReportsHourlySales,
  getReportsPaymentMethods,
  getReportsTopProducts,
} from "@/lib/api/queries";

// Detalle de UN día (medios de pago, productos top y horas) para el modal de
// "Ventas por día". Reutiliza los reportes existentes con from = to = día.
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ message: "Fecha inválida" }, { status: 400 });
  }

  const [payments, products, hours] = await Promise.allSettled([
    getReportsPaymentMethods({ from: date, to: date }),
    getReportsTopProducts({ from: date, to: date, limit: 5 }),
    getReportsHourlySales({ from: date, to: date }),
  ]);

  return NextResponse.json({
    payments: payments.status === "fulfilled" ? payments.value.data : [],
    products: products.status === "fulfilled" ? products.value.data : [],
    hours: hours.status === "fulfilled" ? hours.value.data : [],
  });
}
