"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMaterials, useUsers } from "@/lib/hooks"
import { repairsApi } from "@/lib/api"
import { ApiError } from "@/lib/api-client"
import { priorityLabels, repairStatusLabels } from "@/lib/format"
import type { Repair, RepairInput } from "@/lib/types"

const emptyForm: RepairInput = {
  material_id: 0,
  technician_id: undefined,
  start_date: new Date().toISOString().slice(0, 10),
  end_date: "",
  problem_description: "",
  diagnosis: "",
  intervention: "",
  status: "IN_PROGRESS",
  priority: "MEDIUM",
  replaced_parts: "",
  cost: undefined,
  comments: "",
}

export function RepairFormDialog({
  open,
  onOpenChange,
  repair,
  defaultMaterialId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  repair?: Repair | null
  defaultMaterialId?: number
  onSaved: () => void
}) {
  const { materials } = useMaterials()
  const { users } = useUsers()
  const [form, setForm] = useState<RepairInput>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const isEdit = Boolean(repair)

  useEffect(() => {
    if (repair) {
      setForm({
        material_id: repair.material_id,
        technician_id: repair.technician_id ?? undefined,
        start_date: repair.start_date,
        end_date: repair.end_date ?? "",
        problem_description: repair.problem_description,
        diagnosis: repair.diagnosis ?? "",
        intervention: repair.intervention ?? "",
        status: repair.status,
        priority: repair.priority,
        replaced_parts: repair.replaced_parts ?? "",
        cost: repair.cost ?? undefined,
        comments: repair.comments ?? "",
      })
    } else {
      setForm({ ...emptyForm, material_id: defaultMaterialId ?? 0 })
    }
  }, [repair, defaultMaterialId, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.material_id || !form.problem_description || !form.start_date) {
      toast.error("Veuillez remplir les champs obligatoires")
      return
    }
    setSubmitting(true)
    try {
      const payload: RepairInput = {
        ...form,
        end_date: form.end_date || null,
        diagnosis: form.diagnosis || null,
        intervention: form.intervention || null,
        replaced_parts: form.replaced_parts || null,
        comments: form.comments || null,
        cost: form.cost || null,
        technician_id: form.technician_id || null,
      }
      if (isEdit && repair) {
        await repairsApi.update(repair.id, payload)
        toast.success("Réparation mise à jour")
      } else {
        await repairsApi.create(payload)
        toast.success("Réparation créée")
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Une erreur est survenue"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier la réparation" : "Nouvelle réparation"}
          </DialogTitle>
          <DialogDescription>
            Enregistrez les détails de l&apos;intervention technique.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Matériel *</Label>
            <Select
              value={form.material_id ? String(form.material_id) : ""}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, material_id: Number(v) }))
              }
              disabled={isEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un matériel" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.asset_code} — {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem_description">Description du problème *</Label>
            <Textarea
              id="problem_description"
              value={form.problem_description}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  problem_description: e.target.value,
                }))
              }
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date de début *</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, start_date: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="date"
                value={form.end_date ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, end_date: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={form.status ?? "IN_PROGRESS"}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v ?? "IN_PROGRESS" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(repairStatusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select
                value={form.priority ?? "MEDIUM"}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, priority: v ?? "MEDIUM" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Technicien</Label>
            <Select
              value={
                form.technician_id ? String(form.technician_id) : "none"
              }
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  technician_id: v === "none" ? undefined : Number(v),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Aucun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.first_name} {u.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnostic</Label>
            <Textarea
              id="diagnosis"
              value={form.diagnosis ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, diagnosis: e.target.value }))
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intervention">Intervention réalisée</Label>
            <Textarea
              id="intervention"
              value={form.intervention ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, intervention: e.target.value }))
              }
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="replaced_parts">Pièces remplacées</Label>
              <Input
                id="replaced_parts"
                value={form.replaced_parts ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, replaced_parts: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Coût (TND)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={form.cost ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cost: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Commentaires</Label>
            <Textarea
              id="comments"
              value={form.comments ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, comments: e.target.value }))
              }
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
