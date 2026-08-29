"use client"

import { Menu, LogOut, ChevronsUpDown, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth/auth-context"
import { SidebarContent } from "./sidebar"
import type { RoleName } from "@/types"

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Topbar() {
  const { user, logout, switchRole } = useAuth()
  if (!user) return null

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2">
        {/* Sélecteur de rôle — outil de démonstration RBAC */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden gap-2 sm:flex">
              <ShieldCheck className="size-4 text-primary" />
              <span className="text-xs text-muted-foreground">Rôle :</span>
              <span className="font-medium">{user.role.name}</span>
              <ChevronsUpDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Aperçu par rôle (démo)
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={user.role.name}
              onValueChange={(v) => switchRole(v as RoleName)}
            >
              <DropdownMenuRadioItem value="Administrateur">
                Administrateur
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Technicien">
                Technicien
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Consultant">
                Consultant
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{user.full_name}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {user.role.name}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
