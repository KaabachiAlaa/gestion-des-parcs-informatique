"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Printer, Search, Wrench } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DataPagination } from "@/components/data-pagination";
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
import { searchRepairs } from "@/lib/api/repairs";
import {
  REPAIR_STATUS_LABELS,
  REPAIR_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Repair, RepairPriority, RepairStatus } from "@/lib/types";

export default function ReparationsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RepairStatus | "all">("all");
  const [priority, setPriority] = useState<RepairPriority | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 8;

  const load = useCallback(async () => {
    setLoading(true);
    const result = await searchRepairs({ q: query, status, priority, page, limit });
    setRepairs(result.data);
    setTotal(result.total);
    setTotalPages(result.total_pages);
    setLoading(false);
  }, [query, status, priority, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query, status, priority]);

  return (
    <DashboardShell title="Réparations">
      <PageHeader
        title="Historique des réparations"
        description="Consultez toutes les interventions techniques effectuées sur le parc matériel."
        actions={
          <Button variant="outline" asChild>
            <Link href="/reparations/print" target="_blank">
              <Printer className="size-4" />
              Imprimer l&apos;historique
            </Link>
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par description, matériel, code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as RepairStatus | "all")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(REPAIR_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as RepairPriority | "all")}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
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
        ) : repairs.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Aucune réparation trouvée"
            description="Ajustez vos filtres pour afficher l'historique des interventions."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matériel</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Technicien</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Ouverte le</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairs.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell>
                      <Link
                        href={`/materiels/${repair.material.id}`}
                        className="font-medium text-card-foreground hover:text-primary hover:underline"
                      >
                        {repair.material.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {repair.material.asset_code}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate text-muted-foreground">
                      {repair.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {repair.technician.first_name} {repair.technician.last_name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={PRIORITY_LABELS[repair.priority]}
                        className={PRIORITY_COLORS[repair.priority]}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(repair.opened_at)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={REPAIR_STATUS_LABELS[repair.status]}
                        className={REPAIR_STATUS_COLORS[repair.status]}
                      />
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
    </DashboardShell>
  );
}
