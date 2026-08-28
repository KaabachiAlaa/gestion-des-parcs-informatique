"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import {
  ArrowLeft,
  Pencil,
  Printer,
  Trash2,
  MonitorSmartphone,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { usePageTitle } from "@/lib/page-title-context"
import { useAuth } from "@/lib/auth-context"
import { useCategories, useLocations, useRepairs, useUsers } from "@/lib/hooks"
import { materialsApi } from "@/lib/api"
import { ApiError } from "@/lib/api-client"
import {
  formatCurrency,
  formatDate,
  materialStatusLabels,
  materialStatusVariants,
  repairStatusLabels,
  repairStatusVariants,
} from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { MaterialFormDialog } from "@/components/materials/material-form-dialog"
import { MaterialPrintSheet } from "@/components/materials/material-print-sheet"
import Link from "next/link"

export default function MaterialDetailPage() {
  const params = useParams<{ id: string }>()
  const materialId = Number(params.id)
  const router = useRouter()
  const { canWrite } = useAuth()

  const {
    data: material,
    error,
    isLoading,
    mutate,
  } = useSWR(["material", materialId], () => materialsApi.get(materialId))

  usePageTitle(material?.name ?? "Matériel")

  const { categories } = useCategories()
  const { locations } = useLocations()
  const { users } = useUsers()
  const { repairs: allRepairs } = useRepairs()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const repairs = useMemo(
    () => allRepairs.filter((r) => r.material_id === materialId),
    [allRepairs, materialId]
  )

  const categoryName =
    categories.find((c) => c.id === material?.category_id)?.name ?? "—"
  const locationName = material?.location_id
    ? locations.find((l) => l.id === material.location_id)?.place ?? "—"
    : "—"
  const assignedUser = material?.assigned_user_id
    ? users.find((u) => u.id === material.assigned_user_id)
    : undefined
  const assignedUserName = assignedUser
    ? `${assignedUser.first_name} ${assignedUser.last_name}`
    : "—"

  async function handleDelete() {
    if (!material) return
    try {
      await materialsApi.delete(material.id)
      toast.success("Matériel supprimé")
      router.push("/materiels")
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Suppression impossible"
      )
    } finally {
      setDeleteOpen(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Chargement...</div>
  }

  if (error || !material) {
    return (
      <ErrorState
        message="Impossible de charger ce matériel"
        onRetry={() => mutate()}
      />
    )
  }

  return (
    <>
    <div className="space-y-6 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/materiels")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {material.name}
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              {material.asset_code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          {canWrite && (
            <>
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Catégorie" value={categoryName} />
              <Info
                label="Statut"
                value={
                  <StatusBadge
                    value={material.status}
                    labels={materialStatusLabels}
                    variants={materialStatusVariants}
                  />
                }
              />
              <Info
                label="Marque / Modèle"
                value={`${material.brand ?? "—"} ${material.model ?? ""}`}
              />
              <Info
                label="Numéro de série"
                value={material.serial_number ?? "—"}
              />
              <Info label="Emplacement" value={locationName} />
              <Info label="Utilisateur assigné" value={assignedUserName} />
              <Info
                label="Date d'acquisition"
                value={formatDate(material.acquisition_date)}
              />
              <Info
                label="Fin de garantie"
                value={formatDate(material.warranty_end_date)}
              />
              <Info
                label="Prix d'achat"
                value={formatCurrency(material.purchase_price)}
              />
            </dl>
            {material.description && (
              <div className="mt-4 border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 text-sm">{material.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Réparations</span>
              <span className="font-semibold">{repairs.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Coût cumulé</span>
              <span className="font-semibold">
                {formatCurrency(
                  repairs.reduce((sum, r) => sum + (r.cost ?? 0), 0)
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            Historique des réparations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {repairs.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="Aucune réparation"
              description="Ce matériel n'a jamais été envoyé en réparation."
              className="py-8"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Début</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Problème</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Coût</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.start_date)}</TableCell>
                    <TableCell>{formatDate(r.end_date)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/reparations/${r.id}`}
                        className="hover:underline"
                      >
                        {r.problem_description}
                      </Link>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MaterialFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        material={material}
        onSaved={() => mutate()}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer ce matériel ?"
        description={`Cette action est irréversible. Le matériel "${material.name}" sera définitivement supprimé.`}
        onConfirm={handleDelete}
        confirmLabel="Supprimer"
      />
    </div>

    <MaterialPrintSheet
      material={material}
      categoryName={categoryName}
      locationName={locationName}
      assignedUserName={assignedUserName}
      repairs={repairs}
    />
    </>
  )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}
