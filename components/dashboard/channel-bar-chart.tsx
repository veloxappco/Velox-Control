"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatMoney, parseDateOnly } from "@/lib/format";
import type { SalesSeriesDay } from "@/lib/api/types";

// Ventas por día apiladas: POS (azul) + En línea (verde).
export function ChannelBarChart({ data }: { data: SalesSeriesDay[] }) {
  const chartData = data.map((d) => ({
    ...d,
    fullLabel: new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(
      parseDateOnly(d.date)
    ),
    label: new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(
      parseDateOnly(d.date)
    ),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          stroke="var(--color-muted-foreground)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
          width={48}
        />
        <Tooltip
          cursor={{ fill: "var(--color-secondary)", opacity: 0.6 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as SalesSeriesDay & { fullLabel: string };
            return (
              <div className="min-w-44 rounded-2xl border border-border/60 bg-card p-3.5 shadow-lg">
                <p className="text-xs font-medium text-muted-foreground">{d.fullLabel}</p>
                <p className="mt-0.5 font-display text-xl font-extrabold text-foreground">
                  {formatMoney(d.total)}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">Venta total</p>
                <div className="mt-2.5 flex flex-col gap-1.5 border-t border-border/60 pt-2.5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 font-medium text-accent">
                      <span className="size-2 rounded-full bg-accent" /> POS
                    </span>
                    <span className="font-display font-bold text-foreground">{formatMoney(d.pos_total)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 font-medium text-success">
                      <span className="size-2 rounded-full bg-success" /> En línea
                    </span>
                    <span className="font-display font-bold text-foreground">{formatMoney(d.online_total)}</span>
                  </div>
                </div>
              </div>
            );
          }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="pos_total" name="POS" stackId="a" fill="var(--color-accent)" />
        <Bar dataKey="online_total" name="En línea" stackId="a" fill="var(--color-success)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
