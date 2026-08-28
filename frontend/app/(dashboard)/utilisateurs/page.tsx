"use client"

import { useMemo, useState } from "react"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users as UsersIcon,
  ShieldCheck,
  ShieldOff,
} from "lucide-react"
import { toast } from "sonner"
import { usePageTitle } from "@/lib/page-title-context"
import { useAuth, roleLabel } from "@/lib/auth-context"
import { useRoles, useUsers } from "@/lib/hooks"
import { usersApi } from "@/lib/api"
import { ApiError } from "@/lib/api-client"
import { initials } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TableSkeleton } from "@/components/table-skeleton"
import { ErrorState } from "@/components/error-state"
import { EmptyState } from "@/components/empty-state"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { UserFormDialog } from "@/components/users/user-form-dialog"
import type { User } from "@/lib/types"

const PAGE_SIZE = 10

export default function UtilisateursPage() {
  usePageTitle("Utilisateurs")
  const { isAdmin, user: currentUser } = useAuth()
  const { users, isLoading, error, mutate } = useUsers()
  const { roles } = useRoles()

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)
  const [statusTarget, setStatusTarget] = useState<User | null>(null)

  const roleMap = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles])

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (
        search &&
        !`${u.first_name} ${u.last_name} ${u.username} ${u.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false
      if (roleFilter !== "all" && String(u.role_id) !== roleFilter)
        return false
      if (statusFilter === "active" && !u.is_active) return false
      if (statusFilter === "inactive" && u.is_active) return false
      return true
    })
  }, [users, search, roleFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleDelete() {
    if (!deleting) return
    try {
      await usersApi.delete(deleting.id)
      toast.success("Utilisateur supprimé")
      mutate()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Suppression impossible"
      )
    } finally {
      setDeleting(null)
    }
  }

  async function handleToggleStatus() {
    if (!statusTarget) return
    try {
      await usersApi.setStatus(statusTarget.id, !statusTarget.is_active)
      toast.success(
        statusTarget.is_active
          ? "Utilisateur désactivé"
          : "Utilisateur activé"
      )
      mutate()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Action impossible"
      )
    } finally {
      setStatusTarget(null)
    }
  }

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldOff}
        title="Accès réservé aux administrateurs"
        description="Vous n'avez pas les permissions nécessaires pour consulter la gestion des utilisateurs."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Utilisateurs
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} compte(s) enregistré(s)
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Rechercher par nom, identifiant ou email..."
              className="pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v ?? "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v ?? "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton cols={6} rows={6} />
          </div>
        ) : error ? (
          <ErrorState
            message="Impossible de charger les utilisateurs"
            onRetry={() => mutate()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Aucun utilisateur trouvé"
            description="Ajustez vos filtres ou créez un nouveau compte."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Identifiant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((u) => {
                  const role = roleMap.get(u.role_id)
                  const isSelf = currentUser?.id === u.id
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {initials(u.first_name, u.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {u.first_name} {u.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {u.username}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>{role?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={u.is_active ? "success" : "muted"}>
                          {u.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(u)
                                setFormOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={isSelf}
                              onClick={() => setStatusTarget(u)}
                            >
                              {u.is_active ? (
                                <>
                                  <ShieldOff className="h-4 w-4" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-4 w-4" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={isSelf}
                              onClick={() => setDeleting(u)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {page} sur {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        onSaved={() => mutate()}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Supprimer cet utilisateur ?"
        description={`Le compte de ${deleting?.first_name} ${deleting?.last_name} sera définitivement supprimé.`}
        onConfirm={handleDelete}
        confirmLabel="Supprimer"
      />
      <ConfirmDialog
        open={Boolean(statusTarget)}
        onOpenChange={(v) => !v && setStatusTarget(null)}
        title={
          statusTarget?.is_active
            ? "Désactiver cet utilisateur ?"
            : "Activer cet utilisateur ?"
        }
        description={
          statusTarget?.is_active
            ? "L'utilisateur ne pourra plus se connecter à l'application."
            : "L'utilisateur pourra à nouveau se connecter à l'application."
        }
        onConfirm={handleToggleStatus}
        confirmLabel={statusTarget?.is_active ? "Désactiver" : "Activer"}
      />
    </div>
  )
}
