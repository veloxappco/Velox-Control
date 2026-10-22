"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts";
import { formatMoney, parseDateOnly } from "@/lib/format";
import type { SalesSeriesDay } from "@/lib/api/types";

// Ventas por día apiladas: POS (azul) + En línea (verde).
export function ChannelBarChart({
  data,
  onDayClick,
}: {
  data: SalesSeriesDay[];
  /** Si se pasa, cada barra es clicable y entrega el día. */
  onDayClick?: (day: SalesSeriesDay) => void;
}) {
  // Recharts entrega las props de la barra; los datos del día vienen en `payload`.
  const handleClick = (bar: unknown) => {
    const day = (bar as { payload?: SalesSeriesDay }).payload;
    if (day && onDayClick) onDayClick(day);
  };

  const chartData = data.map((d) => ({
    ...d,
    fullLabel: new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(
      parseDateOnly(d.date)
    ),
    label: new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(
      parseDateOnly(d.date)
    ),
  }));

  // Cantidad de ventas / pedidos dentro de cada segmento (solo si caben).
  const showCounts = chartData.length <= 14;
  type LabelProps = {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    index?: number;
  };
  const countLabel = (key: "pos_count" | "online_count") => {
    function CountLabel({ x = 0, y = 0, width = 0, height = 0, index = 0 }: LabelProps) {
      const n = chartData[index]?.[key] ?? 0;
      if (!showCounts || n <= 0 || Number(height) < 18 || Number(width) < 18) return null;
      return (
        <text
          x={Number(x) + Number(width) / 2}
          y={Number(y) + Number(height) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize={11}
          fontWeight={600}
        >
          {n}
        </text>
      );
    }
    return CountLabel;
  };

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
                <p className="mt-0.5 font-display text-xl font-bold text-foreground">
                  {formatMoney(d.total)}
                </p>
                <p className="text-xs font-medium text-muted-foreground">Venta total</p>
                <div className="mt-2.5 flex flex-col gap-1.5 border-t border-border/60 pt-2.5 text-base">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 font-medium text-accent">
                      <span className="size-2 rounded-full bg-accent" /> Ventas POS
                    </span>
                    <span className="font-display font-bold text-foreground">
                      {formatMoney(d.pos_total)}
                      <span className="ml-1.5 text-xs font-medium text-muted-foreground">· {d.pos_count}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 font-medium text-success">
                      <span className="size-2 rounded-full bg-success" /> Pedidos
                    </span>
                    <span className="font-display font-bold text-foreground">
                      {formatMoney(d.online_total)}
                      <span className="ml-1.5 text-xs font-medium text-muted-foreground">· {d.online_count}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="pos_total"
          name="Ventas POS"
          stackId="a"
          fill="var(--color-accent)"
          cursor={onDayClick ? "pointer" : undefined}
          onClick={handleClick}
        >
          <LabelList content={countLabel("pos_count")} />
        </Bar>
        <Bar
          dataKey="online_total"
          name="Pedidos"
          stackId="a"
          fill="var(--color-success)"
          radius={[6, 6, 0, 0]}
          cursor={onDayClick ? "pointer" : undefined}
          onClick={handleClick}
        >
          <LabelList content={countLabel("online_count")} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
