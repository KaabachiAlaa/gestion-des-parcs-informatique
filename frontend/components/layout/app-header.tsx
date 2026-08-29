"use client";

import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useAuth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";

export function AppHeader({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  function initials() {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 bg-sidebar p-0 text-sidebar-foreground [&_svg]:shrink-0"
        >
          <SheetHeader className="border-b border-sidebar-border px-4 py-4">
            <SheetTitle asChild>
              <Logo className="text-sidebar-foreground" />
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <SidebarNav />
          </div>
        </SheetContent>
      </Sheet>

      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-balance">
        {title}
      </h1>

      <div className="flex items-center gap-2 md:gap-3">
        <RoleSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md p-1 pr-2 transition-colors hover:bg-muted"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {initials()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {user.first_name} {user.last_name}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm font-medium">
                {user.first_name} {user.last_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {ROLE_LABELS[user.role]}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <UserIcon className="size-4" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
