import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api/server";
import { ENDPOINTS } from "@/lib/api/config";
import { setToken } from "@/lib/auth/session";
import type { LoginResponse } from "@/lib/api/types";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { message: "Usuario y contraseña son obligatorios." },
      { status: 422 }
    );
  }

  try {
    const result = await apiFetch<LoginResponse>(ENDPOINTS.auth.login, {
      method: "POST",
      body: JSON.stringify({ username, password, device_name: "VeloxAdmin Web" }),
      withAuth: false,
    });

    // El token se guarda en un cookie httpOnly: nunca llega al JS del navegador.
    await setToken(result.token);

    return NextResponse.json({
      business: result.business,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { message: "No se pudo conectar con el servidor de Velox." },
      { status: 502 }
    );
  }
}
