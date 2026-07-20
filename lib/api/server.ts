import "server-only";
import { API_BASE_URL } from "./config";
import { getToken } from "@/lib/auth/session";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Query params se agregan automáticamente como ?a=1&b=2 */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Si es false, no se envía el token (solo /auth/login lo necesita) */
  withAuth?: boolean;
}

function buildUrl(path: string, params?: ApiFetchOptions["params"]) {
  const url = new URL(path.replace(/^\//, ""), `${API_BASE_URL.replace(/\/$/, "")}/`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Fetch tipado para llamar la API Laravel desde Server Components,
 * Route Handlers o Server Actions. Lee el token del cookie httpOnly
 * automáticamente (nunca se expone al navegador).
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { params, withAuth = true, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (rest.body && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (withAuth) {
    const token = await getToken();
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(buildUrl(path, params), {
    ...rest,
    headers: finalHeaders,
    cache: "no-store",
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      (body as { message?: string } | null)?.message ?? `Error ${res.status} llamando a ${path}`;
    const code = (body as { code?: string } | null)?.code;
    throw new ApiError(message, res.status, code);
  }

  return body as T;
}
