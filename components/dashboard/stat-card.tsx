import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Accent = "primary" | "accent" | "success" | "warning" | "destructive";

// Mismos colores que maneja Badge (primary/accent/success/warning/destructive)
// — icono en caja sólida sobre fondo blanco ("soft") o tarjeta completa a
// color sólido con letras blancas ("solid"), para módulos que quieran ir
// full-color (arrancamos por Egresos en naranja).
const SOLID_CLASSES: Record<Accent, string> = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  destructive: "bg-destructive text-destructive-foreground",
};

const ICON_BADGE_CLASSES: Record<Accent, string> = {
  primary: "bg-primary text-primary-foreground shadow-primary/25",
  accent: "bg-accent text-accent-foreground shadow-accent/25",
  success: "bg-success text-white shadow-success/25",
  warning: "bg-warning text-white shadow-warning/25",
  destructive: "bg-destructive text-destructive-foreground shadow-destructive/25",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  accent = "primary",
  variant = "soft",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  sub?: string;
  accent?: Accent;
  /** "soft": tarjeta blanca con icono en caja de color. "solid": tarjeta
   * completa a color sólido con letras e icono en blanco. */
  variant?: "soft" | "solid";
}) {
  if (variant === "solid") {
    return (
      <Card
        className={cn(
          "relative overflow-hidden border-transparent p-5 shadow-lg",
          SOLID_CLASSES[accent]
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words text-xs font-medium text-white/80">{label}</p>
            <p className="mt-1.5 break-words font-display text-2xl font-black tracking-tight text-white">
              {value}
            </p>
            {sub && <p className="mt-1 break-words text-xs text-white/75">{sub}</p>}
          </div>
          <Icon className="size-5 shrink-0 text-white" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 break-words font-display text-2xl font-black tracking-tight">{value}</p>
          {sub && <p className="mt-1 break-words text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl shadow-lg",
            ICON_BADGE_CLASSES[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}
