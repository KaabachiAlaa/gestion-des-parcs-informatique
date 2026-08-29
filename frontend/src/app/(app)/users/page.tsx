"use client"

import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { toast } from "sonner"
import {
  Plus,
  Users as UsersIcon,
  MoreHorizontal,
  Pencil,
  UserCheck,
  UserX,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { FilterBar, FilterSelect } from "@/components/shared/filter-bar"
import { EmptyState, TableSkeleton } from "@/components/shared/states"
import { RoleBadge, ActiveBadge } from "@/components/shared/status-badge"
import { DataPagination } from "@/components/shared/data-pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { UserFormDialog } from "@/components/users/user-form-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDebounce } from "@/hooks/use-debounce"
import { useAuth } from "@/lib/auth/auth-context"
import {
  usersService,
  referenceService,
  type UserQuery,
} from "@/lib/api/services"
import { formatDate } from "@/lib/format"
import type { User, UserCreateInput } from "@/types"

const ACTIVE_OPTIONS = [
  { label: "Tous les statuts", value: "all" },
  { label: "Actifs", value: "active" },
  { label: "Inactifs", value: "inactive" },
]

const LIMIT = 10

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function UsersPage() {
  const { hasPermission } = useAuth()
  const { mutate } = useSWRConfig()
  const canWrite = hasPermission("users.write")

  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")
  const [active, setActive] = useState("all")
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [toggling, setToggling] = useState<User | null>(null)

  const debouncedSearch = useDebounce(search)

  const { data: roles } = useSWR("ref-roles", () => referenceService.roles())

  const query: UserQuery = {
    q: debouncedSearch,
    role_id: role === "all" ? "all" : Number(role),
    is_active: active as UserQuery["is_active"],
    page,
    limit: LIMIT,
  }
  const { data, isLoading } = useSWR(
    ["users", debouncedSearch, role, active, page],
    () => usersService.search(query),
  )

  const hasFilters = search !== "" || role !== "all" || active !== "all"

  const roleOptions = [
    { label: "Tous les rôles", value: "all" },
    ...(roles?.map((r) => ({ label: r.name, value: String(r.id) })) ?? []),
  ]

  function resetFilters() {
    setSearch("")
    setRole("all")
    setActive("all")
    setPage(1)
  }

  function revalidate() {
    void mutate((k) => Array.isArray(k) && k[0] === "users")
  }

  async function handleSubmit(input: UserCreateInput) {
    if (editing) {
      await usersService.update(editing.id, input)
      toast.success("Utilisateur mis à jour")
    } else {
      await usersService.create(input)
      toast.success("Utilisateur créé")
    }
    setEditing(null)
    revalidate()
  }

  async function handleToggle() {
    if (!toggling) return
    await usersService.toggleActive(toggling.id, !toggling.is_active)
    toast.success(
      toggling.is_active
        ? `Compte de ${toggling.full_name} désactivé`
        : `Compte de ${toggling.full_name} activé`,
    )
    setToggling(null)
    revalidate()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Utilisateurs" },
          ]}
        />
        <PageHeader
          title="Utilisateurs"
          description="Gestion des comptes, des rôles et des accès à la plateforme."
          actions={
            canWrite ? (
              <Button
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
                className="gap-2"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">Ajouter</span>
              </Button>
            ) : null
          }
        />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b border-border p-4">
          <FilterBar
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            searchPlaceholder="Rechercher par nom, identifiant, email…"
            onReset={resetFilters}
            showReset={hasFilters}
          >
            <FilterSelect
              value={role}
              onValueChange={(v) => {
                setRole(v)
                setPage(1)
              }}
              placeholder="Rôle"
              options={roleOptions}
            />
            <FilterSelect
              value={active}
              onValueChange={(v) => {
                setActive(v)
                setPage(1)
              }}
              placeholder="Statut"
              options={ACTIVE_OPTIONS}
            />
          </FilterBar>
        </div>

        {isLoading ? (
          <TableSkeleton rows={LIMIT} cols={5} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Aucun utilisateur trouvé"
            description={
              hasFilters
                ? "Aucun compte ne correspond à vos critères."
                : "Commencez par créer un compte utilisateur."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden lg:table-cell whitespace-nowrap">
                    Créé le
                  </TableHead>
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                            {initials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium">{user.full_name}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role.name} />
                    </TableCell>
                    <TableCell>
                      <ActiveBadge active={user.is_active} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {canWrite ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(user)
                                setFormOpen(true)
                              }}
                            >
                              <Pencil className="size-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setToggling(user)}
                              className={
                                user.is_active
                                  ? "text-destructive focus:text-destructive"
                                  : ""
                              }
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="size-4" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <UserCheck className="size-4" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {data && data.total > 0 ? (
          <DataPagination
            page={data.page}
            totalPages={data.total_pages}
            total={data.total}
            limit={data.limit}
            onPageChange={setPage}
          />
        ) : null}
      </Card>

      <UserFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o)
          if (!o) setEditing(null)
        }}
        user={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(toggling)}
        onOpenChange={(o) => !o && setToggling(null)}
        title={
          toggling?.is_active
            ? "Désactiver ce compte ?"
            : "Activer ce compte ?"
        }
        description={
          toggling ? (
            <>
              Le compte de{" "}
              <span className="font-medium text-foreground">
                {toggling.full_name}
              </span>{" "}
              sera {toggling.is_active ? "désactivé" : "activé"}.{" "}
              {toggling.is_active
                ? "L'utilisateur ne pourra plus se connecter."
                : "L'utilisateur pourra de nouveau se connecter."}
            </>
          ) : null
        }
        confirmLabel={toggling?.is_active ? "Désactiver" : "Activer"}
        destructive={toggling?.is_active}
        onConfirm={handleToggle}
      />
    </div>
  )
}
