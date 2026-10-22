"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Muestra una cifra en UNA línea y, si no cabe en su contenedor, la reduce
// proporcionalmente (hasta `min`) para que nunca se corte con "...".
export function FitText({
  children,
  className,
  min = 0.4,
}: {
  children: ReactNode;
  className?: string;
  /** Escala mínima permitida (0.4 = 40% del tamaño original). */
  min?: number;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;

    const fit = () => {
      i.style.transform = "none";
      const ratio = o.clientWidth / i.scrollWidth;
      i.style.transform = ratio < 1 ? `scale(${Math.max(ratio, min)})` : "none";
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    return () => ro.disconnect();
  }, [children, min]);

  return (
    <div ref={outer} className={cn("min-w-0 overflow-hidden", className)}>
      <span ref={inner} className="inline-block origin-left whitespace-nowrap">
        {children}
      </span>
    </div>
  );
}
