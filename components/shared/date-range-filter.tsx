"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ArrowRight, Calendar, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysAgoISO, todayISO } from "@/lib/format";
import { persistDateRange } from "@/lib/date-range-cookie";

const PRESETS = [
  { label: "Hoy", days: 0 },
  { label: "7 días", days: 7 },
  { label: "30 días", days: 30 },
];

export function DateRangeFilter({
  defaultFrom,
  defaultTo,
}: {
  /** Debe ser el mismo valor por defecto que usa la página para pedir los
   * datos al servidor (p. ej. `from ?? todayISO()`). Si no coincide, el
   * filtro muestra una fecha distinta a la que realmente se consultó. */
  defaultFrom?: string;
  defaultTo?: string;
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const from = searchParams.get("from") ?? defaultFrom ?? todayISO();
  const to = searchParams.get("to") ?? defaultTo ?? todayISO();

  function apply(nextFrom: string, nextTo: string) {
    // Se guarda en cookie para que el filtro quede puesto al entrar a otro
    // módulo (Dashboard, Ingresos, Egresos...), no solo en esta pantalla.
    persistDateRange(nextFrom, nextTo);
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", nextFrom);
    params.set("to", nextTo);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function isActivePreset(days: number) {
    return from === daysAgoISO(days) && to === todayISO();
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm sm:w-[400px]">
      {/* Rango de fechas */}
      <div className="flex items-center gap-2">
        <DateField value={from} onChange={(v) => apply(v, to)} />
        <ArrowRight className="size-4 shrink-0 text-primary" />
        <DateField value={to} onChange={(v) => apply(from, v)} />
      </div>

      {/* Filtros rápidos */}
      <div className="mt-3 flex items-stretch gap-2">
        {PRESETS.map((preset) => {
          const active = isActivePreset(preset.days);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => apply(daysAgoISO(preset.days), todayISO())}
              className={cn(
                "flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full font-display text-sm font-bold transition-all",
                active
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "border border-border bg-card text-foreground/70 hover:bg-secondary/50"
              )}
            >
              <Calendar className={cn("size-4", active ? "text-white" : "text-muted-foreground")} />
              {preset.label}
            </button>
          );
        })}
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => router.refresh())}
          aria-label="Actualizar datos"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:bg-secondary/50 disabled:opacity-50"
        >
          <RefreshCw className={cn("size-4", isPending && "animate-spin")} />
        </button>
      </div>
    </div>
  );
}

function DateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-12 flex-1 min-w-0 items-center gap-2 rounded-2xl border border-border bg-card px-3">
      <Calendar className="size-4 shrink-0 text-primary" />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 border-none bg-transparent p-0 font-display text-sm font-semibold text-foreground outline-none"
      />
    </label>
  );
}
