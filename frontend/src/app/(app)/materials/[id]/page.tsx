"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import {
  ArrowLeft,
  Printer,
  Pencil,
  AlertTriangle,
  MapPin,
  Info,
  Activity,
  Wrench,
  Package,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { EmptyState } from "@/components/shared/states"
import { MaterialStatusBadge } from "@/components/shared/status-badge"
import { MaterialFormDialog } from "@/components/materials/material-form-dialog"
import { RepairHistoryTable } from "@/components/repairs/repair-history-table"
import { RepairDetailDialog } from "@/components/repairs/repair-detail-dialog"
import { PrintHeader } from "@/components/print/print-report"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/format"
import { useAuth } from "@/lib/auth/auth-context"
import { materialsService, repairsService } from "@/lib/api/services"
import type { MaterialCreateInput, Repair } from "@/types"

export default function MaterialDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)
  const { hasPermission } = useAuth()
  const canWrite = hasPermission("materials.write")

  const [editOpen, setEditOpen] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null)

  const {
    data: material,
    isLoading,
    mutate,
  } = useSWR(["material", id], () => materialsService.getById(id))
  const { data: repairs } = useSWR(["material-repairs", id], () =>
    repairsService.listByMaterial(id),
  )

  const openFailures = useMemo(
    () =>
      (repairs ?? []).filter(
        (r) => r.status !== "Résolue" && r.status !== "Annulée",
      ),
    [repairs],
  )

  async function handleSubmit(input: MaterialCreateInput) {
    await materialsService.update(id, input)
    toast.success("Matériel mis à jour")
    void mutate()
  }

  if (isLoading) {
    return <DetailSkeleton />
  }

  if (!material) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Parc matériel", href: "/materials" },
            { label: "Introuvable" },
          ]}
        />
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="Matériel introuvable"
            description="L'équipement demandé n'existe pas ou a été supprimé."
            action={
              <Button asChild variant="outline">
                <button onClick={() => router.push("/materials")}>
                  Retour au parc
                </button>
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 print-container">
      <div className="space-y-4 no-print">
        <Breadcrumbs
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Parc matériel", href: "/materials" },
            { label: material.inventory_number },
          ]}
        />
        <PageHeader
          title={material.name}
          description={`Code inventaire ${material.inventory_number}`}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => router.push("/materials")}
                className="gap-2"
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Retour</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="gap-2"
              >
                <Printer className="size-4" />
                <span className="hidden sm:inline">Imprimer l&apos;historique</span>
              </Button>
              {canWrite ? (
                <Button onClick={() => setEditOpen(true)} className="gap-2">
                  <Pencil className="size-4" />
                  <span className="hidden sm:inline">Modifier</span>
                </Button>
              ) : null}
            </>
          }
        />
      </div>

      <PrintHeader
        title={`Fiche matériel — ${material.name}`}
        subtitle={`Code inventaire : ${material.inventory_number}`}
        meta={`État : ${material.status} · Catégorie : ${material.category.name}`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="size-4 text-muted-foreground" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <InfoRow label="Désignation" value={material.name} />
              <InfoRow label="Code inventaire" value={material.inventory_number} mono />
              <InfoRow label="Catégorie" value={material.category.name} />
              <InfoRow label="Marque" value={material.brand} />
              <InfoRow label="Modèle" value={material.model} />
              <InfoRow label="Numéro de série" value={material.serial_number} mono />
              <InfoRow label="Date d'acquisition" value={formatDate(material.purchase_date)} />
              <InfoRow label="Fin de garantie" value={formatDate(material.warranty_end)} />
              <InfoRow label="Affecté à" value={material.assigned_to?.full_name} />
              <InfoRow label="Ajouté le" value={formatDate(material.created_at)} />
            </dl>
            {material.notes ? (
              <>
                <Separator className="my-4" />
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Notes
                  </p>
                  <p className="text-sm text-pretty">{material.notes}</p>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="size-4 text-muted-foreground" />
                État actuel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MaterialStatusBadge status={material.status} />
              <p className="text-sm text-muted-foreground text-pretty">
                {openFailures.length > 0
                  ? `${openFailures.length} intervention(s) en cours sur cet équipement.`
                  : "Aucune intervention en cours."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4 text-muted-foreground" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {material.location ? (
                <dl className="space-y-3">
                  <InfoRow label="Site" value={material.location.name} />
                  <InfoRow label="Bâtiment" value={material.location.building} />
                  <InfoRow label="Étage" value={material.location.floor} />
                  <InfoRow label="Salle" value={material.location.room} />
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune localisation attribuée.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-muted-foreground" />
            Pannes en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {openFailures.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
              <Package className="size-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aucune panne active. L&apos;équipement est opérationnel.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {openFailures.map((repair) => (
                <li key={repair.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedRepair(repair)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {repair.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Déclarée le {formatDate(repair.reported_at)} ·{" "}
                        {repair.technician?.full_name ?? "Non assignée"}
                      </p>
                    </div>
                    <MaterialStatusBadge status="En réparation" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="size-4 text-muted-foreground" />
            Historique des réparations
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 no-print"
          >
            <Printer className="size-4" />
            Imprimer
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <RepairHistoryTable
            repairs={repairs ?? []}
            onSelect={setSelectedRepair}
          />
        </CardContent>
      </Card>

      <MaterialFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        material={material}
        onSubmit={handleSubmit}
      />

      <RepairDetailDialog
        open={Boolean(selectedRepair)}
        onOpenChange={(o) => !o && setSelectedRepair(null)}
        repair={selectedRepair}
      />
    </div>
  )
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string
  value?: string | null
  mono?: boolean
}) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={mono ? "font-mono text-sm" : "text-sm"}>
        {value || "—"}
      </dd>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-64" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
