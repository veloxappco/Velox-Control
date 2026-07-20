"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarRange, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { daysAgoISO, todayISO } from "@/lib/format";

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

  const [from, setFrom] = useState(searchParams.get("from") ?? defaultFrom ?? todayISO());
  const [to, setTo] = useState(searchParams.get("to") ?? defaultTo ?? todayISO());

  function apply(nextFrom: string, nextTo: string) {
    setFrom(nextFrom);
    setTo(nextTo);
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", nextFrom);
    params.set("to", nextTo);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5">
        <CalendarRange className="size-4 text-muted-foreground" />
        <Input
          type="date"
          value={from}
          onChange={(e) => apply(e.target.value, to)}
          className="h-7 w-[130px] border-none bg-transparent p-0 text-xs focus-visible:ring-0"
        />
        <span className="text-xs text-muted-foreground">→</span>
        <Input
          type="date"
          value={to}
          onChange={(e) => apply(from, e.target.value)}
          className="h-7 w-[130px] border-none bg-transparent p-0 text-xs focus-visible:ring-0"
        />
      </div>
      <div className="flex gap-1.5">
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => apply(daysAgoISO(preset.days), todayISO())}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <Button
        type="button"
        variant="default"
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => router.refresh())}
        aria-label="Actualizar datos"
        className="shrink-0"
      >
        <RefreshCw className={cn("size-4", isPending && "animate-spin")} />
        <span className="hidden sm:inline">Actualizar</span>
      </Button>
    </div>
  );
}
