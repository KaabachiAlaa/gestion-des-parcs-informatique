"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Users as UsersIcon, MoreHorizontal, Pencil, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { searchUsers, toggleUserActive } from "@/lib/api/users";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate, initials } from "@/lib/utils";
import type { Role, User } from "@/lib/types";

const ROLES: Role[] = ["Admin", "Technicien", "Consultant"];

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 8;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await searchUsers({ q: query, role, page, limit });
    setUsers(result.data);
    setTotal(result.total);
    setTotalPages(result.total_pages);
    setLoading(false);
  }, [query, role, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query, role]);

  async function handleToggle() {
    if (!toggleTarget) return;
    await toggleUserActive(toggleTarget.id);
    toast.success(
      toggleTarget.is_active ? "Utilisateur désactivé." : "Utilisateur activé.",
    );
    setToggleTarget(null);
    load();
  }

  return (
    <DashboardShell title="Utilisateurs">
      <PageHeader
        title="Gestion des utilisateurs"
        description="Gérez les comptes, les rôles et les accès de l'équipe."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nouvel utilisateur
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, identifiant, email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={role} onValueChange={(v) => setRole(v as Role | "all")}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Aucun utilisateur trouvé"
            description="Ajustez vos filtres ou créez un nouveau compte."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {initials(u.first_name, u.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-card-foreground">
                            {u.first_name} {u.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">@{u.username}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {ROLE_LABELS[u.role]}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={u.is_active ? "Actif" : "Inactif"}
                        className={
                          u.is_active
                            ? "bg-success/15 text-success border-success/30"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(u.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(u);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant={u.is_active ? "destructive" : "default"}
                            onClick={() => setToggleTarget(u)}
                          >
                            {u.is_active ? (
                              <UserX className="size-4" />
                            ) : (
                              <UserCheck className="size-4" />
                            )}
                            {u.is_active ? "Désactiver" : "Activer"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4">
          <DataPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      </div>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        onSaved={() => load()}
      />

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.is_active ? "Désactiver ce compte ?" : "Activer ce compte ?"}
        description={
          toggleTarget?.is_active
            ? `${toggleTarget?.first_name} ${toggleTarget?.last_name} ne pourra plus se connecter à l'application.`
            : `${toggleTarget?.first_name} ${toggleTarget?.last_name} pourra à nouveau se connecter à l'application.`
        }
        confirmLabel={toggleTarget?.is_active ? "Désactiver" : "Activer"}
        destructive={toggleTarget?.is_active}
        onConfirm={handleToggle}
      />
    </DashboardShell>
  );
}
