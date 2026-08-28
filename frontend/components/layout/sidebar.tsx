"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { navItems } from "@/lib/nav"
import { useAuth, roleLabel } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Sidebar() {
  const pathname = usePathname()
  const { user, isAdmin, logout } = useAuth()

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white p-1">
          <Image
            src="/comet-logo.png"
            alt="Logo COMET"
            width={28}
            height={28}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-semibold text-white">
            COMET
          </span>
          <span className="truncate text-[11px] text-sidebar-foreground/60">
            Parc informatique
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-white">
            {user
              ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
              : "?"}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-white">
              {user ? `${user.first_name} ${user.last_name}` : "Chargement..."}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {user ? roleLabel(user.roleName) : ""}
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Se déconnecter"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-white"
                >
                  <LogOut className="size-4" />
                </button>
              }
            />
            <TooltipContent>Se déconnecter</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  )
}
