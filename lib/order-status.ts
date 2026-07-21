import { CheckCircle2, ChefHat, Clock, Truck, XCircle, type LucideIcon } from "lucide-react";
import { orderStatusLabel, type OrderStatusGroup } from "@/lib/format";

// Un icono consistente por estado en toda la app: Pendiente=reloj,
// En Preparación=chef, Listo=check, Entregado=camión, Cancelado=x.
const ORDER_STATUS_ICONS: Record<OrderStatusGroup, LucideIcon> = {
  Pendiente: Clock,
  "En Preparación": ChefHat,
  Listo: CheckCircle2,
  Entregado: Truck,
  Cancelado: XCircle,
};

export function orderStatusIcon(status: string): LucideIcon {
  return ORDER_STATUS_ICONS[orderStatusLabel(status)];
}

// Mismos colores que `orderStatusVariant` (lib/format.ts), pero como clases
// sólidas/tenues listas para íconos circulares, chips activos, etc.
const ORDER_STATUS_COLORS: Record<OrderStatusGroup, { text: string; soft: string; solid: string }> = {
  Pendiente: { text: "text-accent", soft: "bg-accent/10", solid: "bg-accent" },
  "En Preparación": { text: "text-warning", soft: "bg-warning/10", solid: "bg-warning" },
  Listo: { text: "text-success", soft: "bg-success/10", solid: "bg-success" },
  Entregado: { text: "text-primary", soft: "bg-primary/10", solid: "bg-primary" },
  Cancelado: { text: "text-destructive", soft: "bg-destructive/10", solid: "bg-destructive" },
};

export function orderStatusColors(status: string) {
  return ORDER_STATUS_COLORS[orderStatusLabel(status)];
}
