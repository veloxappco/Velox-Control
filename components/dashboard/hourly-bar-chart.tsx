"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatMoney } from "@/lib/format";
import type { HourlySalesItem } from "@/lib/api/types";

export function HourlyBarChart({ data }: { data: HourlySalesItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="var(--color-muted-foreground)"
          fontSize={10}
          interval={2}
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            fontSize: 12,
          }}
          formatter={(value) => formatMoney(Number(value))}
        />
        <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="var(--color-chart-2)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
