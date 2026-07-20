"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMoney } from "@/lib/format";
import type { SalesSeriesDay } from "@/lib/api/types";

export function SalesAreaChart({ data }: { data: SalesSeriesDay[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(
      new Date(d.date)
    ),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="var(--color-muted-foreground)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
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
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--color-chart-1)"
          strokeWidth={2.5}
          fill="url(#salesGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
