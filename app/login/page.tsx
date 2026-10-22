"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipografía propia del login (Inter), sin tocar el resto de la app.
const INTER = 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const FIELD =
  "h-[54px] w-full rounded-full border border-[#E6E6F0] bg-[#F9F9FC] pl-[52px] text-base text-gray-900 shadow-[0_1px_2px_rgba(20,20,60,0.04)] placeholder:text-gray-400 outline-none transition-all focus:border-[#6D3BE0] focus:bg-white focus:ring-4 focus:ring-[#6D3BE0]/15 disabled:opacity-60";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) errors.username = "Ingresa tu usuario o correo.";
    if (!password) errors.password = "Ingresa tu contraseña.";
    setFieldErrors(errors);
    if (errors.username || errors.password) {
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const body = await res.json();

      if (!res.ok) {
        setError(body.message ?? "No se pudo iniciar sesión.");
        setLoading(false);
        return;
      }

      const next = searchParams.get("next") ?? "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-dvh justify-center bg-white md:items-center md:bg-[#F1ECFB] md:py-10"
      style={{ fontFamily: INTER }}
    >
      <div className="flex min-h-dvh w-full max-w-[440px] flex-col bg-white md:min-h-0 md:overflow-hidden md:rounded-[32px] md:shadow-2xl md:shadow-[#6230C9]/20">
        {/* Encabezado: degradado morado + curva blanca orgánica */}
        <header
          className="relative flex min-h-[40dvh] flex-col justify-center px-7 pb-24 pt-[max(env(safe-area-inset-top),3rem)] text-center text-white"
          style={{ background: "linear-gradient(115deg, #B52FDC 0%, #7A33DA 48%, #5B2ECF 100%)" }}
        >
          <h1 className="text-[32px] font-semibold leading-[1.15] tracking-tight">
            Bienvenido,
            <br />
            administrador
          </h1>
          <p className="mx-auto mt-3 max-w-[17rem] text-[17px] leading-snug text-white/80">
            Ingresa a tu panel de gestión gastronómica
          </p>

          <svg
            aria-hidden="true"
            viewBox="0 0 390 120"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-[-1px] h-[120px] w-full"
          >
            {/* sombra morada oscura a la izquierda */}
            <path d="M0,50 C25,30 70,26 105,46 C140,66 165,92 230,104 L230,120 L0,120 Z" fill="#3F1DA8" fillOpacity="0.4" />
            {/* brillo suave a la derecha */}
            <path d="M200,98 C270,90 330,58 390,50 L390,120 L200,120 Z" fill="#ffffff" fillOpacity="0.08" />
            {/* curva blanca */}
            <path
              d="M0,80 C18,52 50,32 90,32 C135,32 165,60 218,60 C272,60 302,36 346,37 C372,38 386,54 390,76 L390,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </header>

        {/* Formulario */}
        <section className="flex flex-1 flex-col px-7 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-3">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="pl-1 text-base font-semibold text-[#1C1C2E]">
                Usuario o correo
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6D3BE0]" />
                <input
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="email"
                  enterKeyHint="next"
                  placeholder="tu-negocio"
                  value={username}
                  disabled={loading}
                  aria-invalid={Boolean(fieldErrors.username)}
                  aria-describedby={fieldErrors.username ? "username-error" : undefined}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) setFieldErrors((f) => ({ ...f, username: undefined }));
                  }}
                  className={cn(FIELD, "pr-4", fieldErrors.username && "border-red-400 bg-red-50/40")}
                />
              </div>
              {fieldErrors.username && (
                <p id="username-error" className="text-[13px] text-red-600">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="pl-1 text-base font-semibold text-[#1C1C2E]">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6D3BE0]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  enterKeyHint="go"
                  placeholder="••••••••"
                  value={password}
                  disabled={loading}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
                  }}
                  className={cn(FIELD, "pr-14", fieldErrors.password && "border-red-400 bg-red-50/40")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                  className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 outline-none transition-colors hover:text-gray-700 focus-visible:ring-4 focus-visible:ring-[#7739D9]/15"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="text-[13px] text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div aria-live="polite">
              {error && (
                <p
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-snug text-red-700"
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex h-[60px] w-full items-center justify-center gap-2 rounded-[30px] text-lg font-medium text-white shadow-[0_14px_28px_-10px_rgba(77,90,245,0.55)] outline-none transition-all hover:shadow-[0_18px_32px_-10px_rgba(77,90,245,0.65)] hover:brightness-105 focus-visible:ring-4 focus-visible:ring-[#6D3BE0]/30 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              style={{ background: "linear-gradient(100deg, #6C38F2 0%, #3A7BFB 100%)" }}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-auto pt-12 text-center text-[13px] text-gray-500">
            VeloxAdmin © {new Date().getFullYear()} — hecho para tu negocio
          </p>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
