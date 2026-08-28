"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, LogOut } from "lucide-react"
import { navItems } from "@/lib/nav"
import { useAuth, roleLabel } from "@/lib/auth-context"
import { usePageTitleContext } from "@/lib/page-title-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function useBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const navItem = navItems.find((item) => item.href === href)
    const label =
      navItem?.label ??
      (Number.isFinite(Number(segment))
        ? `#${segment}`
        : segment.charAt(0).toUpperCase() + segment.slice(1))
    return { href, label }
  })
}

export function Header() {
  const crumbs = useBreadcrumbs()
  const { user, isAdmin, logout } = useAuth()
  const pathname = usePathname()
  const { title } = usePageTitleContext()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="size-4" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          }
        />
        <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="border-b border-sidebar-border px-5 py-5 text-left">
            <SheetTitle className="flex items-center gap-3 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white p-1">
                <Image
                  src="/comet-logo.png"
                  alt="Logo COMET"
                  width={28}
                  height={28}
                  className="h-full w-full object-contain"
                />
              </div>
              COMET
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-3 py-4">
            {navItems
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)
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
                    {item.label}
                  </Link>
                )
              })}
            <button
              type="button"
              onClick={logout}
              className="mt-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-white"
            >
              <LogOut className="size-4 shrink-0" />
              Se déconnecter
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-base font-semibold text-card-foreground sm:text-lg">
          {title}
        </h1>
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard">Accueil</Link>} />
            </BreadcrumbItem>
            {crumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === crumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={<Link href={crumb.href}>{crumb.label}</Link>}
                    />
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {user && (
        <div className="hidden flex-col items-end text-right sm:flex">
          <span className="text-sm font-medium text-card-foreground">
            {user.first_name} {user.last_name}
          </span>
          <span className="text-xs text-muted-foreground">
            {roleLabel(user.roleName)}
          </span>
        </div>
      )}
    </header>
  )
}
