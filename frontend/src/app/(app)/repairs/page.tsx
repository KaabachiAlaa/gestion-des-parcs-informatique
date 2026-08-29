"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR, { useSWRConfig } from "swr"
import { toast } from "sonner"
import { Plus, Printer, Wrench, Eye, Pencil } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { FilterBar, FilterSelect } from "@/components/shared/filter-bar"
import { EmptyState, TableSkeleton } from "@/components/shared/states"
import { RepairStatusBadge } from "@/components/shared/status-badge"
import { DataPagination } from "@/components/shared/data-pagination"
import { RepairDetailDialog } from "@/components/repairs/repair-detail-dialog"
import { RepairFormDialog } from "@/components/repairs/repair-form-dialog"
import { PrintHeader } from "@/components/print/print-report"
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
import { useDebounce } from "@/hooks/use-debounce"
import { useAuth } from "@/lib/auth/auth-context"
import { repairsService, type RepairQuery } from "@/lib/api/services"
import { formatDate } from "@/lib/format"
import type { Repair, RepairCreateInput, RepairStatus } from "@/types"

const STATUS_OPTIONS = [
  { label: "Tous les statuts", value: "all" },
  { label: "Ouverte", value: "Ouverte" },
  { label: "En cours", value: "En cours" },
  { label: "En attente", value: "En attente" },
  { label: "Résolue", value: "Résolue" },
  { label: "Annulée", value: "Annulée" },
]

const LIMIT = 10

export default function RepairsPage() {
  const { hasPermission } = useAuth()
  const { mutate } = useSWRConfig()
  const canWrite = hasPermission("repairs.write")

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)

  const [detail, setDetail] = useState<Repair | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Repair | null>(null)

  const debouncedSearch = useDebounce(search)

  const query: RepairQuery = {
    q: debouncedSearch,
    status: status as RepairQuery["status"],
    page,
    limit: LIMIT,
  }
  const { data, isLoading } = useSWR(
    ["repairs", debouncedSearch, status, page],
    () => repairsService.search(query),
  )

  const hasFilters = search !== "" || status !== "all"

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setPage(1)
  }

  function revalidate() {
    void mutate((k) => Array.isArray(k) && k[0] === "repairs")
  }

  async function handleSubmit(input: RepairCreateInput) {
    if (editing) {
      await repairsService.update(editing.id, input)
      toast.success("Réparation mise à jour")
    } else {
      await repairsService.create(input)
      toast.success("Réparation déclarée")
    }
    setEditing(null)
    revalidate()
  }

  return (
    <div className="space-y-6 print-container">
      <div className="space-y-4 no-print">
        <Breadcrumbs
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Réparations" },
          ]}
        />
        <PageHeader
          title="Historique des réparations"
          description="Suivi général des pannes et interventions sur le parc."
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="gap-2"
              >
                <Printer className="size-4" />
                <span className="hidden sm:inline">
                  Imprimer l&apos;historique
                </span>
              </Button>
              {canWrite ? (
                <Button
                  onClick={() => {
                    setEditing(null)
                    setFormOpen(true)
                  }}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Déclarer</span>
                </Button>
              ) : null}
            </>
          }
        />
      </div>

      <PrintHeader
        title="Historique général des réparations"
        subtitle="Parc informatique Comet"
        meta={data ? `${data.total} intervention(s) enregistrée(s)` : undefined}
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b border-border p-4 no-print">
          <FilterBar
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            searchPlaceholder="Rechercher par matériel ou description…"
            onReset={resetFilters}
            showReset={hasFilters}
          >
            <FilterSelect
              value={status}
              onValueChange={(v) => {
                setStatus(v)
                setPage(1)
              }}
              placeholder="Statut"
              options={STATUS_OPTIONS}
            />
          </FilterBar>
        </div>

        {isLoading ? (
          <TableSkeleton rows={LIMIT} cols={6} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Aucune réparation trouvée"
            description={
              hasFilters
                ? "Aucune intervention ne correspond à vos critères."
                : "Aucune réparation n'a encore été enregistrée."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead>Matériel</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Technicien
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden lg:table-cell whitespace-nowrap">
                    Résolue le
                  </TableHead>
                  <TableHead className="w-12 text-right no-print">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(repair.reported_at)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/materials/${repair.material.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {repair.material.name}
                      </Link>
                      <p className="font-mono text-xs text-muted-foreground">
                        {repair.material.inventory_number}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-[16rem]">
                      <p className="truncate text-sm">{repair.description}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {repair.technician?.full_name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <RepairStatusBadge status={repair.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(repair.resolved_at)}
                    </TableCell>
                    <TableCell className="text-right no-print">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setDetail(repair)}
                          aria-label="Voir les détails"
                        >
                          <Eye className="size-4" />
                        </Button>
                        {canWrite ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => {
                              setEditing(repair)
                              setFormOpen(true)
                            }}
                            aria-label="Modifier"
                          >
                            <Pencil className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {data && data.total > 0 ? (
          <div className="no-print">
            <DataPagination
              page={data.page}
              totalPages={data.total_pages}
              total={data.total}
              limit={data.limit}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </Card>

      <RepairDetailDialog
        open={Boolean(detail)}
        onOpenChange={(o) => !o && setDetail(null)}
        repair={detail}
      />

      <RepairFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o)
          if (!o) setEditing(null)
        }}
        repair={editing}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
