import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/server";
import { ENDPOINTS } from "@/lib/api/config";
import { clearToken } from "@/lib/auth/session";

export async function POST() {
  try {
    await apiFetch(ENDPOINTS.auth.logout, { method: "POST" });
  } catch {
    // Aunque falle en el backend, igual limpiamos la sesión local.
  }

  await clearToken();
  return NextResponse.json({ message: "Sesión cerrada." });
}
