"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Upload, Search, MoreHorizontal, Pencil, Trash2, Eye, Laptop } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MaterialFormDialog } from "@/components/materials/material-form-dialog";
import { ImportExcelDialog } from "@/components/materials/import-excel-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { searchMaterials, deleteMaterial } from "@/lib/api/materials";
import { getCategories, getLocations } from "@/lib/api/meta";
import { useAuth } from "@/lib/auth";
import { MATERIAL_STATUS_LABELS, MATERIAL_STATUS_COLORS } from "@/lib/constants";
import type { Category, Location, Material, MaterialStatus } from "@/lib/types";

export default function MaterielsPage() {
  const { user } = useAuth();
  const canManage = user.role === "Admin" || user.role === "Technicien";

  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MaterialStatus | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 8;

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await searchMaterials({ q: query, status, page, limit });
    setMaterials(result.data);
    setTotal(result.total);
    setTotalPages(result.total_pages);
    setLoading(false);
  }, [query, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getCategories().then(setCategories);
    getLocations().then(setLocations);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, status]);

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMaterial(deleteTarget.id);
    toast.success("Matériel supprimé.");
    setDeleteTarget(null);
    load();
  }

  return (
    <DashboardShell title="Matériels">
      <PageHeader
        title="Parc matériel"
        description="Gérez l'ensemble des équipements informatiques de l'entreprise."
        actions={
          canManage ? (
            <>
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Upload className="size-4" />
                Importer Excel
              </Button>
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="size-4" />
                Ajouter un matériel
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, code, marque, numéro de série..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as MaterialStatus | "all")}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(MATERIAL_STATUS_LABELS).map(([value, label]) => (
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
        ) : materials.length === 0 ? (
          <EmptyState
            icon={Laptop}
            title="Aucun matériel trouvé"
            description="Ajustez vos filtres ou ajoutez un nouveau matériel au parc."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Désignation</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Assigné à</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.asset_code}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-card-foreground">
                          {material.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {material.brand} {material.model}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {material.category.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {material.location.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {material.assigned_user
                        ? `${material.assigned_user.first_name} ${material.assigned_user.last_name}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={MATERIAL_STATUS_LABELS[material.status]}
                        className={MATERIAL_STATUS_COLORS[material.status]}
                      />
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
                          <DropdownMenuItem asChild>
                            <Link href={`/materiels/${material.id}`}>
                              <Eye className="size-4" />
                              Voir les détails
                            </Link>
                          </DropdownMenuItem>
                          {canManage ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditing(material);
                                  setFormOpen(true);
                                }}
                              >
                                <Pencil className="size-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(material)}
                              >
                                <Trash2 className="size-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </>
                          ) : null}
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

      <MaterialFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        material={editing}
        categories={categories}
        locations={locations}
        onSaved={() => load()}
      />

      <ImportExcelDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => load()}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer ce matériel ?"
        description={`Cette action est irréversible. "${deleteTarget?.name}" sera définitivement supprimé du parc.`}
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleDelete}
      />
    </DashboardShell>
  );
}
