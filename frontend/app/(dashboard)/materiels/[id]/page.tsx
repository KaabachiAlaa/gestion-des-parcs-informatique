"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Pencil } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { MaterialFormDialog } from "@/components/materials/material-form-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMaterial } from "@/lib/api/materials";
import { searchRepairs } from "@/lib/api/repairs";
import { getCategories, getLocations } from "@/lib/api/meta";
import { useAuth } from "@/lib/auth";
import {
  MATERIAL_STATUS_LABELS,
  MATERIAL_STATUS_COLORS,
  REPAIR_STATUS_LABELS,
  REPAIR_STATUS_COLORS,
} from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Category, Location, Material, Repair } from "@/lib/types";
import { Wrench } from "lucide-react";

export default function MaterialDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const canManage = user.role === "Admin" || user.role === "Technicien";
  const id = Number(params.id);

  const [material, setMaterial] = useState<Material | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  async function load() {
    setLoading(true);
    const [m, r, c, l] = await Promise.all([
      getMaterial(id),
      searchRepairs({ material_id: id, limit: 50 }),
      getCategories(),
      getLocations(),
    ]);
    setMaterial(m ?? null);
    setRepairs(r.data);
    setCategories(c);
    setLocations(l);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <DashboardShell title="Matériel">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (!material) {
    return (
      <DashboardShell title="Matériel">
        <EmptyState
          icon={Wrench}
          title="Matériel introuvable"
          description="Cet équipement n'existe pas ou a été supprimé."
          action={
            <Button variant="outline" onClick={() => router.push("/materiels")}>
              Retour au parc matériel
            </Button>
          }
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Détails du matériel">
      <div>
        <Link
          href="/materiels"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Retour au parc matériel
        </Link>
        <PageHeader
          title={material.name}
          description={`${material.asset_code} · ${material.brand} ${material.model}`}
          actions={
            <>
              <Button variant="outline" asChild>
                <Link href={`/materiels/${material.id}/print`} target="_blank">
                  <Printer className="size-4" />
                  Imprimer la fiche
                </Link>
              </Button>
              {canManage ? (
                <Button onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  Modifier
                </Button>
              ) : null}
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Informations générales
          </h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow label="Statut">
              <StatusBadge
                label={MATERIAL_STATUS_LABELS[material.status]}
                className={MATERIAL_STATUS_COLORS[material.status]}
              />
            </InfoRow>
            <InfoRow label="Numéro de série" value={material.serial_number} />
            <InfoRow label="Catégorie" value={material.category.name} />
            <InfoRow label="Emplacement" value={material.location.name} />
            <InfoRow
              label="Assigné à"
              value={
                material.assigned_user
                  ? `${material.assigned_user.first_name} ${material.assigned_user.last_name}`
                  : "Non assigné"
              }
            />
            <InfoRow label="Date d'acquisition" value={formatDate(material.acquisition_date)} />
            <InfoRow
              label="Fin de garantie"
              value={material.warranty_end_date ? formatDate(material.warranty_end_date) : "—"}
            />
            <InfoRow
              label="Prix d'achat"
              value={material.purchase_price ? formatCurrency(material.purchase_price) : "—"}
            />
          </dl>
          {material.description ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground">Description</p>
              <p className="mt-1 text-sm text-card-foreground">{material.description}</p>
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Résumé</h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Interventions totales</span>
              <span className="font-medium text-card-foreground">{repairs.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">En cours</span>
              <span className="font-medium text-card-foreground">
                {repairs.filter((r) => r.status !== "TERMINEE" && r.status !== "ANNULEE").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">
          Historique des réparations
        </h3>
        {repairs.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Aucune réparation enregistrée"
            description="Cet équipement n'a jamais fait l'objet d'une intervention."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Technicien</TableHead>
                  <TableHead>Ouverte le</TableHead>
                  <TableHead>Clôturée le</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairs.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell className="max-w-[280px] truncate">
                      {repair.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {repair.technician.first_name} {repair.technician.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(repair.opened_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {repair.closed_at ? formatDate(repair.closed_at) : "—"}
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
      </div>

      <MaterialFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        material={material}
        categories={categories}
        locations={locations}
        onSaved={() => load()}
      />
    </DashboardShell>
  );
}

function InfoRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-card-foreground">{children ?? value}</dd>
    </div>
  );
}
