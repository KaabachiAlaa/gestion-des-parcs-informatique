"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Monitor,
  Wrench,
  Inbox,
  Users,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import type { Role } from "@/lib/constants"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: Role[]
}

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    roles: ["Admin", "Technicien", "Consultant"],
  },
  {
    href: "/materials",
    label: "Matériels",
    icon: Monitor,
    roles: ["Admin", "Technicien", "Consultant"],
  },
  {
    href: "/repairs",
    label: "Réparations",
    icon: Wrench,
    roles: ["Admin", "Technicien"],
  },
  {
    href: "/requests",
    label: "Demandes",
    icon: Inbox,
    roles: ["Admin", "Technicien", "Consultant"],
  },
  {
    href: "/users",
    label: "Utilisateurs",
    icon: Users,
    roles: ["Admin"],
  },
]

export function AppSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const { role } = useAuth()

  const items = NAV.filter((item) => (role ? item.roles.includes(role) : false))

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-md bg-white p-1">
              <Image
                src="/comet-logo.png"
                alt="COMET"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">COMET</p>
              <p className="text-[11px] text-sidebar-foreground/60">Gestion du parc</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <p className="text-[11px] leading-relaxed text-sidebar-foreground/50">
            Ensemble pour aller plus loin
          </p>
        </div>
      </aside>
    </>
  )
}
