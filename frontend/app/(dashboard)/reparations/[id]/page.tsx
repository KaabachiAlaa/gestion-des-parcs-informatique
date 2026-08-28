"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import Link from "next/link"
import { ArrowLeft, Pencil, Printer, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { usePageTitle } from "@/lib/page-title-context"
import { useAuth } from "@/lib/auth-context"
import { useMaterials, useUsers } from "@/lib/hooks"
import { repairsApi } from "@/lib/api"
import { ApiError } from "@/lib/api-client"
import {
  formatCurrency,
  formatDate,
  priorityLabels,
  priorityVariants,
  repairStatusLabels,
  repairStatusVariants,
} from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { ErrorState } from "@/components/error-state"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { RepairFormDialog } from "@/components/repairs/repair-form-dialog"
import { RepairPrintSheet } from "@/components/repairs/repair-print-sheet"

export default function RepairDetailPage() {
  const params = useParams<{ id: string }>()
  const repairId = Number(params.id)
  const router = useRouter()
  const { canWrite } = useAuth()

  const {
    data: repair,
    error,
    isLoading,
    mutate,
  } = useSWR(["repair", repairId], () => repairsApi.get(repairId))

  usePageTitle("Réparation")

  const { materials } = useMaterials()
  const { users } = useUsers()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const material = repair
    ? materials.find((m) => m.id === repair.material_id)
    : undefined
  const technician =
    repair?.technician_id != null
      ? users.find((u) => u.id === repair.technician_id)
      : undefined
  const technicianName = technician
    ? `${technician.first_name} ${technician.last_name}`
    : "—"

  async function handleDelete() {
    if (!repair) return
    try {
      await repairsApi.delete(repair.id)
      toast.success("Réparation supprimée")
      router.push("/reparations")
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Suppression impossible"
      )
    } finally {
      setDeleteOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">Chargement...</div>
    )
  }

  if (error || !repair) {
    return (
      <ErrorState
        message="Impossible de charger cette réparation"
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
              onClick={() => router.push("/reparations")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-balance">
                Réparation #{repair.id}
              </h1>
              <p className="text-sm text-muted-foreground">
                {material ? (
                  <Link
                    href={`/materiels/${material.id}`}
                    className="hover:underline"
                  >
                    {material.name} ({material.asset_code})
                  </Link>
                ) : (
                  `Matériel #${repair.material_id}`
                )}
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
              <CardTitle>Détails de l&apos;intervention</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <Info label="Technicien" value={technicianName} />
                <Info
                  label="Statut"
                  value={
                    <StatusBadge
                      value={repair.status}
                      labels={repairStatusLabels}
                      variants={repairStatusVariants}
                    />
                  }
                />
                <Info
                  label="Priorité"
                  value={
                    <StatusBadge
                      value={repair.priority}
                      labels={priorityLabels}
                      variants={priorityVariants}
                    />
                  }
                />
                <Info label="Coût" value={formatCurrency(repair.cost)} />
                <Info
                  label="Date de début"
                  value={formatDate(repair.start_date)}
                />
                <Info
                  label="Date de fin"
                  value={formatDate(repair.end_date)}
                />
              </dl>

              <div className="mt-4 space-y-4 border-t pt-4">
                <TextBlock
                  label="Problème signalé"
                  value={repair.problem_description}
                />
                <TextBlock label="Diagnostic" value={repair.diagnosis} />
                <TextBlock
                  label="Intervention réalisée"
                  value={repair.intervention}
                />
                <TextBlock
                  label="Pièces remplacées"
                  value={repair.replaced_parts}
                />
                <TextBlock label="Commentaires" value={repair.comments} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Matériel concerné</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {material ? (
                <>
                  <Info label="Nom" value={material.name} />
                  <Info label="Code" value={material.asset_code} />
                  <Info
                    label="Marque / Modèle"
                    value={`${material.brand ?? "—"} ${material.model ?? ""}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => router.push(`/materiels/${material.id}`)}
                  >
                    Voir la fiche matériel
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Matériel introuvable ou supprimé.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <RepairFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          repair={repair}
          onSaved={() => mutate()}
        />
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Supprimer cette réparation ?"
          description="Cette action est irréversible."
          onConfirm={handleDelete}
          confirmLabel="Supprimer"
        />
      </div>

      <RepairPrintSheet
        repair={repair}
        materialName={material?.name ?? `Matériel #${repair.material_id}`}
        materialCode={material?.asset_code ?? "—"}
        technicianName={technicianName}
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

function TextBlock({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  )
}
