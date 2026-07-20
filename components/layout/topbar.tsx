"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, ChefHat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { BusinessPayload, UserPayload } from "@/lib/api/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function Topbar({
  business,
  user,
}: {
  business: BusinessPayload;
  user: UserPayload | null;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-lg md:px-6 md:gap-3">
      <div className="flex shrink-0 items-center gap-2 md:hidden">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-brand">
          <ChefHat className="size-4 text-white" />
        </div>
        <span className="font-semibold text-gradient-brand">VeloxAdmin</span>
      </div>

      <div className="hidden shrink-0 flex-col md:flex">
        <span className="text-xs text-muted-foreground">
          {business.city ? `${business.city} · ` : ""}
          {business.timezone}
        </span>
      </div>

      <div className="min-w-0 flex-1 text-right md:text-left">
        <span className="block truncate text-sm text-muted-foreground">
          Hola, <span className="font-medium text-foreground">{business.name}</span>
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex shrink-0 items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
            <Avatar>
              <AvatarFallback>{initials(user?.name ?? business.name)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{user?.name ?? business.name}</span>
              <span className="text-xs text-muted-foreground">{user?.email ?? business.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout} disabled={loggingOut}>
            <LogOut className="size-4" />
            {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
