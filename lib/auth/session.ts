import "server-only";
import { cookies } from "next/headers";

export const TOKEN_COOKIE = "velox_token";

// Duración del cookie del navegador. El token real de Laravel expira según
// admin_api.token_ttl_days (por defecto 30 días) — lo igualamos aquí.
const COOKIE_MAX_AGE_DAYS = 30;

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value;
}

export async function setToken(token: string) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
  });
}

export async function clearToken() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}
