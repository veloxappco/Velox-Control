"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipografía propia del login (Inter), sin tocar el resto de la app.
const INTER = 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const FIELD =
  "h-12 w-full rounded-2xl border border-gray-200 bg-gray-50/70 pl-11 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#7739D9] focus:bg-white focus:ring-4 focus:ring-[#7739D9]/15 disabled:opacity-60";

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
          className="relative px-6 pb-24 pt-[max(env(safe-area-inset-top),3.5rem)] text-center text-white"
          style={{ background: "linear-gradient(160deg, #A34BE8 0%, #7739D9 55%, #6230C9 100%)" }}
        >
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">Bienvenido, administrador</h1>
          <p className="mx-auto mt-2 max-w-[18rem] text-[15px] leading-snug text-white/80">
            Ingresa a tu panel de gestión gastronómica
          </p>

          <svg
            aria-hidden="true"
            viewBox="0 0 440 80"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-[-1px] h-[72px] w-full"
          >
            <path
              d="M0,46 C70,12 130,6 205,30 C285,56 360,58 440,24 L440,80 L0,80 Z"
              fill="white"
              fillOpacity="0.22"
            />
            <path d="M0,58 C80,26 150,20 225,42 C300,64 370,62 440,40 L440,80 L0,80 Z" fill="white" />
          </svg>
        </header>

        {/* Formulario */}
        <section className="flex flex-1 flex-col px-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-2">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-[13px] font-medium text-gray-700">
                Usuario o correo
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#7739D9]" />
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
              <label htmlFor="password" className="text-[13px] font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#7739D9]" />
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
                  className={cn(FIELD, "pr-12", fieldErrors.password && "border-red-400 bg-red-50/40")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                  className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 outline-none transition-colors hover:text-gray-700 focus-visible:ring-4 focus-visible:ring-[#7739D9]/15"
                >
                  {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
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
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-medium text-white shadow-lg shadow-[#8439EE]/25 outline-none transition-all hover:shadow-xl hover:shadow-[#8439EE]/30 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-[#7739D9]/30 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              style={{ background: "linear-gradient(90deg, #8439EE 0%, #3978F5 100%)" }}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-auto pt-10 text-center text-xs text-gray-500">
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
