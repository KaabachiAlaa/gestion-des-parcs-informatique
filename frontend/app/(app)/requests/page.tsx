"use client"

import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { toast } from "sonner"
import { Plus, Inbox, Eye, LifeBuoy, Wrench, ShoppingCart } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { FilterBar, FilterSelect } from "@/components/shared/filter-bar"
import { EmptyState, TableSkeleton } from "@/components/shared/states"
import {
  RequestStatusBadge,
  RequestPriorityBadge,
  RequestTypeBadge,
} from "@/components/shared/status-badge"
import { DataPagination } from "@/components/shared/data-pagination"
import { RequestDetailDialog } from "@/components/requests/request-detail-dialog"
import { RequestFormDialog } from "@/components/requests/request-form-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { requestsService, type RequestQuery } from "@/lib/api/services"
import { formatDate } from "@/lib/format"
import type { RequestCreateInput, RequestType, SupportRequest } from "@/types"

const STATUS_OPTIONS = [
  { label: "Tous les statuts", value: "all" },
  { label: "Nouvelle", value: "Nouvelle" },
  { label: "En traitement", value: "En traitement" },
  { label: "Approuvée", value: "Approuvée" },
  { label: "Rejetée", value: "Rejetée" },
  { label: "Clôturée", value: "Clôturée" },
]

const TYPE_TABS: { label: string; value: string; icon: typeof Inbox }[] = [
  { label: "Toutes", value: "all", icon: Inbox },
  { label: "Support", value: "Support", icon: LifeBuoy },
  { label: "Intervention", value: "Intervention", icon: Wrench },
  { label: "Achat", value: "Achat", icon: ShoppingCart },
]

const LIMIT = 10

export default function RequestsPage() {
  const { hasPermission } = useAuth()
  const { mutate } = useSWRConfig()
  const canWrite = hasPermission("requests.write")

  const [search, setSearch] = useState("")
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)

  const [detail, setDetail] = useState<SupportRequest | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const debouncedSearch = useDebounce(search)

  const query: RequestQuery = {
    q: debouncedSearch,
    type: type as RequestQuery["type"],
    status: status as RequestQuery["status"],
    page,
    limit: LIMIT,
  }
  const { data, isLoading } = useSWR(
    ["requests", debouncedSearch, type, status, page],
    () => requestsService.search(query),
  )

  const hasFilters = search !== "" || status !== "all"

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setPage(1)
  }

  function revalidate() {
    void mutate((k) => Array.isArray(k) && k[0] === "requests")
  }

  async function handleSubmit(input: RequestCreateInput) {
    await requestsService.create(input)
    toast.success("Demande soumise")
    revalidate()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Demandes" },
          ]}
        />
        <PageHeader
          title="Demandes"
          description="Demandes de support, d'intervention et d'achat du parc informatique."
          actions={
            canWrite ? (
              <Button
                onClick={() => setFormOpen(true)}
                className="gap-2"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">Nouvelle demande</span>
              </Button>
            ) : null
          }
        />
      </div>

      <Tabs
        value={type}
        onValueChange={(v) => {
          setType(v)
          setPage(1)
        }}
      >
        <TabsList>
          {TYPE_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
              <t.icon className="size-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b border-border p-4">
          <FilterBar
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            searchPlaceholder="Rechercher une demande…"
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
          <TableSkeleton rows={LIMIT} cols={5} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Aucune demande trouvée"
            description={
              hasFilters || type !== "all"
                ? "Aucune demande ne correspond à vos critères."
                : "Aucune demande n'a encore été soumise."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Demande</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Priorité
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Demandeur
                  </TableHead>
                  <TableHead className="hidden lg:table-cell whitespace-nowrap">
                    Créée le
                  </TableHead>
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="max-w-[18rem]">
                      <button
                        type="button"
                        onClick={() => setDetail(request)}
                        className="text-left font-medium hover:text-primary hover:underline"
                      >
                        {request.title}
                      </button>
                      <p className="truncate text-xs text-muted-foreground">
                        {request.material
                          ? request.material.inventory_number
                          : "Sans matériel"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <RequestTypeBadge type={request.type} />
                    </TableCell>
                    <TableCell>
                      <RequestStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <RequestPriorityBadge priority={request.priority} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {request.requested_by.full_name}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(request.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setDetail(request)}
                        aria-label="Voir les détails"
                      >
                        <Eye className="size-4" />
                      </Button>
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

      <RequestDetailDialog
        open={Boolean(detail)}
        onOpenChange={(o) => !o && setDetail(null)}
        request={detail}
      />

      <RequestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
