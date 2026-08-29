import {
  LayoutDashboard,
  Boxes,
  Wrench,
  Users,
  Inbox,
  type LucideIcon,
} from "lucide-react"
import type { Permission } from "@/lib/auth/permissions"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  permission: Permission
}

export const navItems: NavItem[] = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.read",
  },
  {
    label: "Parc matériel",
    href: "/materials",
    icon: Boxes,
    permission: "materials.read",
  },
  {
    label: "Réparations",
    href: "/repairs",
    icon: Wrench,
    permission: "repairs.read",
  },
  {
    label: "Demandes",
    href: "/requests",
    icon: Inbox,
    permission: "requests.read",
  },
  {
    label: "Utilisateurs",
    href: "/users",
    icon: Users,
    permission: "users.read",
  },
]
