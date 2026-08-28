"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { usePageTitle } from "@/lib/page-title-context"
import { useAuth } from "@/lib/auth-context"
import { useMaterials, useRepairs, useUsers } from "@/lib/hooks"
import { repairsApi } from "@/lib/api"
import { ApiError } from "@/lib/api-client"
import {
  priorityLabels,
  priorityVariants,
  repairStatusLabels,
  repairStatusVariants,
  formatDate,
  formatCurrency,
} from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { StatusBadge } from "@/components/status-badge"
import { TableSkeleton } from "@/components/table-skeleton"
import { ErrorState } from "@/components/error-state"
import { EmptyState } from "@/components/empty-state"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { RepairFormDialog } from "@/components/repairs/repair-form-dialog"
import type { Repair } from "@/lib/types"

const PAGE_SIZE = 10

export default function ReparationsPage() {
  usePageTitle("Réparations")
  const { canWrite } = useAuth()
  const { repairs, isLoading, error, mutate } = useRepairs()
  const { materials } = useMaterials()
  const { users } = useUsers()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Repair | null>(null)
  const [deleting, setDeleting] = useState<Repair | null>(null)

  const materialMap = useMemo(
    () => new Map(materials.map((m) => [m.id, m])),
    [materials]
  )
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const filtered = useMemo(() => {
    return repairs.filter((r) => {
      const material = materialMap.get(r.material_id)
      if (
        search &&
        !`${material?.name ?? ""} ${material?.asset_code ?? ""} ${
          r.problem_description
        }`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false
      if (statusFilter !== "all" && r.status !== statusFilter) return false
      if (priorityFilter !== "all" && r.priority !== priorityFilter)
        return false
      return true
    })
  }, [repairs, materialMap, search, statusFilter, priorityFilter])

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      ),
    [filtered]
  )

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleDelete() {
    if (!deleting) return
    try {
      await repairsApi.delete(deleting.id)
      toast.success("Réparation supprimée")
      mutate()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Suppression impossible"
      )
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Réparations
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} intervention(s) enregistrée(s)
          </p>
        </div>
        {canWrite && (
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Nouvelle réparation
          </Button>
        )}
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
              placeholder="Rechercher par matériel ou description..."
              className="pl-9"
            />
          </div>
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
              {Object.entries(repairStatusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priorityFilter}
            onValueChange={(v) => {
              setPriorityFilter(v ?? "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              {Object.entries(priorityLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton cols={7} rows={6} />
          </div>
        ) : error ? (
          <ErrorState
            message="Impossible de charger les réparations"
            onRetry={() => mutate()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Aucune réparation trouvée"
            description="Ajustez vos filtres ou créez une nouvelle intervention."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matériel</TableHead>
                  <TableHead>Problème</TableHead>
                  <TableHead>Technicien</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Coût</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((r) => {
                  const material = materialMap.get(r.material_id)
                  const tech = r.technician_id
                    ? userMap.get(r.technician_id)
                    : undefined
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Link
                          href={`/reparations/${r.id}`}
                          className="font-medium hover:underline"
                        >
                          {material?.name ?? `Matériel #${r.material_id}`}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {material?.asset_code}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {r.problem_description}
                      </TableCell>
                      <TableCell>
                        {tech ? `${tech.first_name} ${tech.last_name}` : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(r.start_date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          value={r.priority}
                          labels={priorityLabels}
                          variants={priorityVariants}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          value={r.status}
                          labels={repairStatusLabels}
                          variants={repairStatusVariants}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(r.cost)}
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
                              render={
                                <Link href={`/reparations/${r.id}`}>
                                  <Eye className="h-4 w-4" />
                                  Voir le détail
                                </Link>
                              }
                            />
                            {canWrite && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditing(r)
                                    setFormOpen(true)
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setDeleting(r)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </>
                            )}
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

      <RepairFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        repair={editing}
        onSaved={() => mutate()}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Supprimer cette réparation ?"
        description="Cette action est irréversible."
        onConfirm={handleDelete}
        confirmLabel="Supprimer"
      />
    </div>
  )
}
