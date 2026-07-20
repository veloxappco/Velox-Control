import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  accent = "primary",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  sub?: string;
  accent?: "primary" | "accent" | "success" | "warning" | "destructive";
}) {
  const accentClasses: Record<string, string> = {
    primary: "bg-primary text-primary-foreground shadow-primary/25",
    accent: "bg-accent text-accent-foreground shadow-accent/25",
    success: "bg-success text-white shadow-success/25",
    warning: "bg-warning text-white shadow-warning/25",
    destructive: "bg-destructive text-destructive-foreground shadow-destructive/25",
  };

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
            accentClasses[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}
