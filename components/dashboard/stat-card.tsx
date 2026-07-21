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

// Mismo estilo "tenue" que los íconos de la tarjeta Ventas por canal: fondo
// muy suave del color y el ícono en ese mismo color, sin sombra.
const ICON_BADGE_CLASSES: Record<Accent, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  accent = "primary",
  variant = "soft",
  size = "default",
  className,
  valueClassName,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  sub?: string;
  accent?: Accent;
  /** "soft": tarjeta blanca con icono en caja de color. "solid": tarjeta
   * completa a color sólido con letras e icono en blanco. */
  variant?: "soft" | "solid";
  /** "compact": para grids angostos (2 columnas en mobile) — letras más
   * chicas y menos padding, para que la cifra nunca se corte. */
  size?: "default" | "compact";
  className?: string;
  /** Sobrescribe el tamaño de texto de la cifra (p. ej. "text-4xl") cuando
   * una tarjeta puntual necesita destacar más que el resto. */
  valueClassName?: string;
}) {
  const compact = size === "compact";

  if (variant === "solid") {
    return (
      <Card
        className={cn(
          "relative overflow-hidden border-transparent shadow-lg",
          compact ? "p-4" : "p-5",
          SOLID_CLASSES[accent],
          className
        )}
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={cn(
                "break-words font-display font-bold text-white/80",
                compact ? "text-[11px]" : "text-xs"
              )}
            >
              {label}
            </p>
            <p
              className={cn(
                "break-words font-display font-extrabold tracking-tight text-white",
                compact ? "mt-1 text-lg" : "mt-1.5 text-2xl",
                valueClassName
              )}
            >
              {value}
            </p>
            {sub && (
              <p
                className={cn(
                  "break-words font-display font-semibold text-white/75",
                  compact ? "mt-0.5 text-[11px]" : "mt-1 text-xs"
                )}
              >
                {sub}
              </p>
            )}
          </div>
          <Icon className={cn("shrink-0 text-white", compact ? "size-4" : "size-5")} />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden", compact ? "p-4" : "p-5", className)}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "break-words font-display font-bold text-muted-foreground",
              compact ? "text-[11px]" : "text-xs"
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "break-words font-display font-extrabold tracking-tight",
              compact ? "mt-1 text-lg" : "mt-1.5 text-2xl",
              valueClassName
            )}
          >
            {value}
          </p>
          {sub && (
            <p
              className={cn(
                "break-words font-display font-semibold text-muted-foreground",
                compact ? "mt-0.5 text-[11px]" : "mt-1 text-xs"
              )}
            >
              {sub}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl",
            compact ? "size-8" : "size-10",
            ICON_BADGE_CLASSES[accent]
          )}
        >
          <Icon className={compact ? "size-4" : "size-5"} />
        </div>
      </div>
    </Card>
  );
}
