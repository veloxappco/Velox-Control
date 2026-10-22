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
      <TabsList className="grid h-auto w-full grid-cols-4 gap-1 rounded-2xl p-1">
        {tabs.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="flex-col gap-0 rounded-xl px-1 py-2 text-[13px] leading-tight sm:flex-row sm:gap-1.5"
          >
            <span>{t.label}</span>
            {t.count !== undefined && <span className="text-[11px] font-medium opacity-80">{t.count}</span>}
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
