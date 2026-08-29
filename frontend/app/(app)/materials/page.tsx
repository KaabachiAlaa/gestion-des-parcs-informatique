"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import useSWR, { useSWRConfig } from "swr"
import { toast } from "sonner"
import {
  Plus,
  Upload,
  Boxes,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { FilterBar, FilterSelect } from "@/components/shared/filter-bar"
import { EmptyState, TableSkeleton } from "@/components/shared/states"
import { MaterialStatusBadge } from "@/components/shared/status-badge"
import { DataPagination } from "@/components/shared/data-pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { MaterialFormDialog } from "@/components/materials/material-form-dialog"
import { ImportExcelDialog } from "@/components/materials/import-excel-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { useAuth } from "@/lib/auth/auth-context"
import {
  materialsService,
  referenceService,
  type MaterialQuery,
} from "@/lib/api/services"
import type {
  Material,
  MaterialCreateInput,
  MaterialStatus,
} from "@/types"

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "Tous les états", value: "all" },
  { label: "En service", value: "En service" },
  { label: "En panne", value: "En panne" },
  { label: "En réparation", value: "En réparation" },
  { label: "En stock", value: "En stock" },
  { label: "Réformé", value: "Réformé" },
]

const LIMIT = 10

type SortKey = "inventory_number" | "name" | "status"
type SortDir = "asc" | "desc"

export default function MaterialsPage() {
  const { hasPermission } = useAuth()
  const { mutate } = useSWRConfig()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [category, setCategory] = useState("all")
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>("inventory_number")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const [deleting, setDeleting] = useState<Material | null>(null)

  const debouncedSearch = useDebounce(search)
  const canWrite = hasPermission("materials.write")
  const canDelete = hasPermission("materials.delete")
  const canImport = hasPermission("materials.import")

  const { data: categories } = useSWR("ref-categories", () =>
    referenceService.categories(),
  )

  const query: MaterialQuery = {
    q: debouncedSearch,
    status: status as MaterialQuery["status"],
    category_id: category === "all" ? "all" : Number(category),
    page,
    limit: LIMIT,
  }
  const key = ["materials", debouncedSearch, status, category, page] as const
  const { data, isLoading } = useSWR(key, () => materialsService.search(query))

  const rows = useMemo(() => {
    if (!data) return []
    const sorted = [...data.data].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1
      return String(a[sortKey]).localeCompare(String(b[sortKey]), "fr") * dir
    })
    return sorted
  }, [data, sortKey, sortDir])

  const categoryOptions = useMemo(
    () => [
      { label: "Toutes les catégories", value: "all" },
      ...(categories?.map((c) => ({ label: c.name, value: String(c.id) })) ??
        []),
    ],
    [categories],
  )

  const hasFilters = search !== "" || status !== "all" || category !== "all"

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setCategory("all")
    setPage(1)
  }

  function toggleSort(k: SortKey) {
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(k)
      setSortDir("asc")
    }
  }

  function revalidate() {
    void mutate((k) => Array.isArray(k) && k[0] === "materials")
  }

  async function handleSubmit(input: MaterialCreateInput) {
    if (editing) {
      await materialsService.update(editing.id, input)
      toast.success("Matériel mis à jour")
    } else {
      await materialsService.create(input)
      toast.success("Matériel ajouté")
    }
    setEditing(null)
    revalidate()
  }

  async function handleDelete() {
    if (!deleting) return
    await materialsService.remove(deleting.id)
    toast.success(`Matériel ${deleting.inventory_number} supprimé`)
    setDeleting(null)
    revalidate()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Parc matériel" },
          ]}
        />
        <PageHeader
          title="Parc matériel"
          description="Inventaire complet des équipements informatiques."
          actions={
            <>
              {canImport ? (
                <Button
                  variant="outline"
                  onClick={() => setImportOpen(true)}
                  className="gap-2"
                >
                  <Upload className="size-4" />
                  <span className="hidden sm:inline">Importer Excel</span>
                </Button>
              ) : null}
              {canWrite ? (
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
              ) : null}
            </>
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
            searchPlaceholder="Rechercher par nom, code, série…"
            onReset={resetFilters}
            showReset={hasFilters}
          >
            <FilterSelect
              value={status}
              onValueChange={(v) => {
                setStatus(v)
                setPage(1)
              }}
              placeholder="État"
              options={STATUS_OPTIONS}
            />
            <FilterSelect
              value={category}
              onValueChange={(v) => {
                setCategory(v)
                setPage(1)
              }}
              placeholder="Catégorie"
              options={categoryOptions}
              width="w-[190px]"
            />
          </FilterBar>
        </div>

        {isLoading ? (
          <TableSkeleton rows={LIMIT} cols={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="Aucun matériel trouvé"
            description={
              hasFilters
                ? "Aucun équipement ne correspond à vos critères de recherche."
                : "Commencez par ajouter un équipement au parc informatique."
            }
            action={
              canWrite && !hasFilters ? (
                <Button
                  onClick={() => {
                    setEditing(null)
                    setFormOpen(true)
                  }}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  Ajouter un matériel
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <SortHeader
                    label="Code"
                    active={sortKey === "inventory_number"}
                    dir={sortDir}
                    onClick={() => toggleSort("inventory_number")}
                  />
                  <SortHeader
                    label="Désignation"
                    active={sortKey === "name"}
                    dir={sortDir}
                    onClick={() => toggleSort("name")}
                  />
                  <TableHead className="hidden md:table-cell">
                    Catégorie
                  </TableHead>
                  <SortHeader
                    label="État"
                    active={sortKey === "status"}
                    dir={sortDir}
                    onClick={() => toggleSort("status")}
                  />
                  <TableHead className="hidden lg:table-cell">
                    Localisation
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Affecté à
                  </TableHead>
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((material) => (
                  <TableRow key={material.id} className="group">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {material.inventory_number}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/materials/${material.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {material.name}
                      </Link>
                      {material.brand ? (
                        <p className="text-xs text-muted-foreground">
                          {material.brand}
                          {material.model ? ` · ${material.model}` : ""}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {material.category.name}
                    </TableCell>
                    <TableCell>
                      <MaterialStatusBadge status={material.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {material.location?.name ?? "—"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {material.assigned_to?.full_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        material={material}
                        canWrite={canWrite}
                        canDelete={canDelete}
                        onEdit={() => {
                          setEditing(material)
                          setFormOpen(true)
                        }}
                        onDelete={() => setDeleting(material)}
                      />
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

      <MaterialFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o)
          if (!o) setEditing(null)
        }}
        material={editing}
        onSubmit={handleSubmit}
      />

      <ImportExcelDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={revalidate}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Supprimer ce matériel ?"
        description={
          deleting ? (
            <>
              L&apos;équipement{" "}
              <span className="font-medium text-foreground">
                {deleting.name}
              </span>{" "}
              ({deleting.inventory_number}) sera définitivement retiré du parc.
              Cette action est irréversible.
            </>
          ) : null
        }
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "-ml-1 inline-flex items-center gap-1.5 rounded px-1 py-0.5 text-left font-medium transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 opacity-50" />
        )}
      </button>
    </TableHead>
  )
}

function RowActions({
  material,
  canWrite,
  canDelete,
  onEdit,
  onDelete,
}: {
  material: Material
  canWrite: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/materials/${material.id}`}>
            <Eye className="size-4" />
            Voir les détails
          </Link>
        </DropdownMenuItem>
        {canWrite ? (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-4" />
            Modifier
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" />
              Supprimer
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
