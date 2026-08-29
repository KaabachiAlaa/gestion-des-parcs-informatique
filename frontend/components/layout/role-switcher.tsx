"use client";

import { FlaskConical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/lib/types";

const ROLES: Role[] = ["Admin", "Technicien", "Consultant"];

// Dev-only affordance so reviewers can preview role-based access without a
// real login for each account. Not part of the production auth flow.
export function RoleSwitcher() {
  const { user, setRole } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FlaskConical className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Rôle de démo :</span>
          <span className="text-foreground">{ROLE_LABELS[user.role]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Prévisualiser en tant que</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((role) => (
          <DropdownMenuItem key={role} onClick={() => setRole(role)}>
            {ROLE_LABELS[role]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
