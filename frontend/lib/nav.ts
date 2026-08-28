import {
  LayoutDashboard,
  MonitorSmartphone,
  Wrench,
  Users,
  ClipboardList,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/materiels", label: "Matériels", icon: MonitorSmartphone },
  { href: "/reparations", label: "Réparations", icon: Wrench },
  {
    href: "/utilisateurs",
    label: "Utilisateurs",
    icon: Users,
    adminOnly: true,
  },
  { href: "/demandes", label: "Demandes", icon: ClipboardList },
]
