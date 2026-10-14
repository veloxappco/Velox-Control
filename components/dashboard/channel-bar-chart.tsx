"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatMoney, parseDateOnly } from "@/lib/format";
import type { SalesSeriesDay } from "@/lib/api/types";

// Ventas por día apiladas: POS (azul) + En línea (verde).
export function ChannelBarChart({ data }: { data: SalesSeriesDay[] }) {
  const chartData = data.map((d) => ({
    ...d,
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
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            fontSize: 12,
          }}
          formatter={(value) => formatMoney(Number(value))}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="pos_total" name="POS" stackId="a" fill="var(--color-accent)" />
        <Bar dataKey="online_total" name="En línea" stackId="a" fill="var(--color-success)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
