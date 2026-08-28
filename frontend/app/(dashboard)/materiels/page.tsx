"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Upload,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react"
import { usePageTitle } from "@/lib/page-title-context"
import { useAuth } from "@/lib/auth-context"
import { useCategories, useLocations, useMaterials } from "@/lib/hooks"
import { materialsApi } from "@/lib/api"
import { materialStatusLabels, materialStatusVariants } from "@/lib/format"
import { ApiError } from "@/lib/api-client"
import { toast } from "sonner"
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
import { MaterialFormDialog } from "@/components/materials/material-form-dialog"
import { MaterialImportDialog } from "@/components/materials/material-import-dialog"
import type { Material } from "@/lib/types"
import { MonitorSmartphone } from "lucide-react"

const PAGE_SIZE = 10

export default function MaterielsPage() {
  usePageTitle("Matériels")
  const { canWrite } = useAuth()
  const { materials, isLoading, error, mutate } = useMaterials()
  const { categories } = useCategories()
  const { locations } = useLocations()

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const [deleting, setDeleting] = useState<Material | null>(null)

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  )
  const locationMap = useMemo(
    () => new Map(locations.map((l) => [l.id, l.place])),
    [locations]
  )

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      if (
        search &&
        !`${m.name} ${m.asset_code} ${m.serial_number ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false
      if (categoryFilter !== "all" && String(m.category_id) !== categoryFilter)
        return false
      if (statusFilter !== "all" && m.status !== statusFilter) return false
      if (
        locationFilter !== "all" &&
        String(m.location_id ?? "") !== locationFilter
      )
        return false
      return true
    })
  }, [materials, search, categoryFilter, statusFilter, locationFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleDelete() {
    if (!deleting) return
    try {
      await materialsApi.delete(deleting.id)
      toast.success("Matériel supprimé")
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
            Parc de matériels
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} équipement(s) référencé(s)
          </p>
        </div>
        {canWrite && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" />
              Importer Excel
            </Button>
            <Button
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Ajouter un matériel
            </Button>
          </div>
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
              placeholder="Rechercher par nom, code actif, numéro de série..."
              className="pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v ?? "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
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
              {Object.entries(materialStatusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={locationFilter}
            onValueChange={(v) => {
              setLocationFilter(v ?? "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Emplacement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous emplacements</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l.id} value={String(l.id)}>
                  {l.place}
                </SelectItem>
              ))}
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
            message="Impossible de charger les matériels"
            onRetry={() => mutate()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MonitorSmartphone}
            title="Aucun matériel trouvé"
            description="Ajustez vos filtres ou ajoutez un nouveau matériel au parc."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code actif</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">
                      {m.asset_code}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/materiels/${m.id}`}
                        className="font-medium hover:underline"
                      >
                        {m.name}
                      </Link>
                      {m.brand && (
                        <p className="text-xs text-muted-foreground">
                          {m.brand} {m.model}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {categoryMap.get(m.category_id) ?? "—"}
                    </TableCell>
                    <TableCell>
                      {m.location_id
                        ? locationMap.get(m.location_id) ?? "—"
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        value={m.status}
                        labels={materialStatusLabels}
                        variants={materialStatusVariants}
                      />
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
                              <Link href={`/materiels/${m.id}`}>
                                <Eye className="h-4 w-4" />
                                Voir la fiche
                              </Link>
                            }
                          />
                          {canWrite && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditing(m)
                                  setFormOpen(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleting(m)}
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
                ))}
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

      <MaterialFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        material={editing}
        onSaved={() => mutate()}
      />
      <MaterialImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => mutate()}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Supprimer ce matériel ?"
        description={`Cette action est irréversible. Le matériel "${deleting?.name}" sera définitivement supprimé.`}
        onConfirm={handleDelete}
        confirmLabel="Supprimer"
      />
    </div>
  )
}
