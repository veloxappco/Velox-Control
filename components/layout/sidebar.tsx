"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand shadow-lg shadow-primary/30">
          <ChefHat className="size-5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-gradient-brand">
          Velox Control
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-brand text-white shadow-md shadow-primary/25"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-5 text-xs text-sidebar-foreground/40">
        Velox © {new Date().getFullYear()}
      </div>
    </aside>
  );
}
