"use client";

import { ChevronDown } from "lucide-react";

// Botón "Cargar más" compartido — mismo estilo tipo card que "Ver ranking
// completo" en Top de productos (morado, bordes 20px, sombra suave), pero
// centrado y de ancho propio en vez de ancho completo.
export function LoadMoreButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 flex shrink-0 items-center justify-center gap-2 self-center rounded-[20px] border border-border/60 bg-card px-5 py-3 shadow-sm transition-all duration-200 hover:bg-secondary/30 hover:shadow-md active:scale-[0.99]"
    >
      <ChevronDown className="size-4 shrink-0 text-primary" />
      <span className="font-display text-sm font-semibold text-primary">{label}</span>
    </button>
  );
}
