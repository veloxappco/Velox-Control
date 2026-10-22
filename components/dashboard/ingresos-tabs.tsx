"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabDef {
  value: string;
  label: string;
  count?: number;
  content: ReactNode;
}

// Pestañas de Ingresos: cada sección se arma en el servidor y aquí solo se
// elige cuál mostrar.
export function IngresosTabs({ tabs }: { tabs: TabDef[] }) {
  return (
    <Tabs defaultValue={tabs[0]?.value} className="min-w-0 gap-5">
      <TabsList className="grid h-auto w-full gap-1 rounded-2xl p-1"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="flex-col gap-0 rounded-xl px-1 py-2 text-sm leading-tight sm:flex-row sm:gap-1.5"
          >
            <span>{t.label}</span>
            {t.count !== undefined && <span className="text-xs font-medium opacity-80">{t.count}</span>}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.value} value={t.value} className="min-w-0">
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
