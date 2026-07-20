import {
  LayoutDashboard,
  ClipboardList,
  Receipt,
  PackageSearch,
  Wallet,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/egresos", label: "Egresos", icon: Receipt },
  { href: "/inventario", label: "Inventario", icon: PackageSearch },
  { href: "/caja", label: "Caja", icon: Wallet },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
];
