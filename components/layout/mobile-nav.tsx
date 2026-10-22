"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Barra flotante (solo móvil): Dashboard, Ingresos, Egresos, Caja y un quinto
// botón "más" que abre el menú lateral con todas las opciones.
const MAIN_HREFS = ["/dashboard", "/ingresos", "/egresos", "/caja"];

export function MobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const mainItems = MAIN_HREFS.map((href) => NAV_ITEMS.find((i) => i.href === href)).filter(
    (i): i is (typeof NAV_ITEMS)[number] => Boolean(i)
  );
  // "Más" se ve activo cuando estás en una pantalla que no está en la barra.
  const moreActive = !MAIN_HREFS.some((href) => pathname.startsWith(href));

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden">
        <nav
          aria-label="Navegación principal"
          className="pointer-events-auto mx-auto flex max-w-md items-center justify-between rounded-[28px] border border-border/60 bg-card/95 p-2 shadow-[0_10px_32px_-8px_rgba(76,45,150,0.28)] backdrop-blur-xl"
        >
          {mainItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className="group relative flex flex-1 items-center justify-center py-1"
              >
                <span
                  className={cn(
                    "flex size-12 items-center justify-center rounded-2xl transition-all duration-200 group-active:scale-95",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                  )}
                >
                  <Icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.9} />
                </span>
                {active && <span className="absolute bottom-0 h-1 w-6 rounded-full bg-primary" />}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Más opciones"
            aria-haspopup="dialog"
            className="group relative flex flex-1 items-center justify-center py-1"
          >
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-2xl transition-all duration-200 group-active:scale-95",
                moreActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
              )}
            >
              <MoreHorizontal className="size-[22px]" />
            </span>
            {moreActive && <span className="absolute bottom-0 h-1 w-6 rounded-full bg-primary" />}
          </button>
        </nav>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 gap-0 p-0">
          <div className="flex items-center gap-2.5 px-6 py-6">
            <Image src="/logo-velox.png" alt="Velox" width={40} height={40} className="size-10 shrink-0" />
            <span className="text-lg font-semibold tracking-tight text-gradient-brand">VeloxAdmin</span>
          </div>
          <nav className="flex flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors",
                    active
                      ? "bg-gradient-brand font-semibold text-white shadow-md shadow-primary/25"
                      : "text-sidebar-foreground/70 hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <Icon className="size-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
