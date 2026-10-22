"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ArrowRight, Calendar, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysAgoISO, monthStartISO, todayISO, weekStartISO } from "@/lib/format";
import { persistDateRange } from "@/lib/date-range-cookie";

const PRESETS = [
  { label: "Hoy", range: () => ({ from: daysAgoISO(0), to: todayISO() }) },
  { label: "Esta semana", range: () => ({ from: weekStartISO(), to: todayISO() }) },
  { label: "Este mes", range: () => ({ from: monthStartISO(), to: todayISO() }) },
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

  function isActivePreset(range: () => { from: string; to: string }) {
    const r = range();
    return from === r.from && to === r.to;
  }

  return (
    <div className="w-full sm:w-[380px]">
      {/* Rango de fechas */}
      <div className="flex items-center gap-2">
        <DateField value={from} onChange={(v) => apply(v, to)} />
        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
        <DateField value={to} onChange={(v) => apply(from, v)} />
      </div>

      {/* Filtros rápidos */}
      <div className="mt-2.5 flex items-center gap-2">
        {PRESETS.map((preset) => {
          const active = isActivePreset(preset.range);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                const r = preset.range();
                apply(r.from, r.to);
              }}
              className={cn(
                "flex h-9 flex-1 items-center justify-center rounded-full px-3 text-sm font-medium transition-all active:scale-[0.97]",
                active
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "border border-border/70 bg-card text-foreground/75 hover:bg-secondary/50"
              )}
            >
              {preset.label}
            </button>
          );
        })}
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => router.refresh())}
          aria-label="Actualizar datos"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card text-primary transition-colors hover:bg-secondary/50 disabled:opacity-50"
        >
          <RefreshCw className={cn("size-3.5", isPending && "animate-spin")} />
        </button>
      </div>
    </div>
  );
}

function DateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/70 bg-card px-3 transition-colors focus-within:border-primary/60">
      <Calendar className="size-3.5 shrink-0 text-primary" />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 border-none bg-transparent p-0 text-sm font-medium text-foreground outline-none"
      />
    </label>
  );
}
