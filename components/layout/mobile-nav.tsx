"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar/95 backdrop-blur-lg md:hidden">
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-sidebar-foreground/50"
              )}
            >
              <Icon className={cn("size-5", active && "drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]")} />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-sidebar/95" />
    </nav>
  );
}
