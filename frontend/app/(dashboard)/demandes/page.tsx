"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Inbox } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DataPagination } from "@/components/data-pagination";
import { RequestFormDialog } from "@/components/requests/request-form-dialog";
import { RequestDetailDialog } from "@/components/requests/request-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";
import { searchRequests } from "@/lib/api/requests";
import {
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { RequestStatus, RequestType, ServiceRequest } from "@/lib/types";

export default function DemandesPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [type, setType] = useState<RequestType | "all">("all");
  const [status, setStatus] = useState<RequestStatus | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 8;

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await searchRequests({ q: query, type, status, page, limit });
    setRequests(result.data);
    setTotal(result.total);
    setTotalPages(result.total_pages);
    setLoading(false);
  }, [query, type, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query, type, status]);

  return (
    <DashboardShell title="Demandes">
      <PageHeader
        title="Demandes de support et d'achat"
        description="Suivez les demandes de support, d'intervention et d'achat de l'ensemble de l'équipe."
        actions={
          <Button
            onClick={() => {
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nouvelle demande
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, code, description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={type} onValueChange={(v) => setType(v as RequestType | "all")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus | "all")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
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
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Aucune demande trouvée"
            description="Ajustez vos filtres ou créez une nouvelle demande."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(request)}
                  >
                    <TableCell className="font-medium">{request.code}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-card-foreground">
                      {request.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {REQUEST_TYPE_LABELS[request.type]}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.created_by.first_name} {request.created_by.last_name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={PRIORITY_LABELS[request.priority]}
                        className={PRIORITY_COLORS[request.priority]}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={REQUEST_STATUS_LABELS[request.status]}
                        className={REQUEST_STATUS_COLORS[request.status]}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(request.created_at)}
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

      <RequestFormDialog open={formOpen} onOpenChange={setFormOpen} onSaved={() => load()} />

      <RequestDetailDialog
        request={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        onUpdated={() => load()}
      />
    </DashboardShell>
  );
}
