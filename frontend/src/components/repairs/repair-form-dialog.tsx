"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Loader2 } from "lucide-react"
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
import { materialsService, usersService } from "@/lib/api/services"
import type { Repair, RepairCreateInput, RepairStatus } from "@/types"

const REPAIR_STATUSES: RepairStatus[] = [
  "Ouverte",
  "En cours",
  "En attente",
  "Résolue",
  "Annulée",
]

const NONE = "__none__"

const emptyForm: RepairCreateInput = {
  material_id: 0,
  description: "",
  status: "Ouverte",
  technician_id: null,
  resolution: "",
  cost: undefined,
}

export function RepairFormDialog({
  open,
  onOpenChange,
  repair,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  repair?: Repair | null
  onSubmit: (input: RepairCreateInput) => Promise<void>
}) {
  const isEdit = Boolean(repair)
  const [form, setForm] = useState<RepairCreateInput>(emptyForm)
  const [saving, setSaving] = useState(false)

  const { data: materialsPage } = useSWR("ref-materials-all", () =>
    materialsService.search({ page: 1, limit: 100 }),
  )
  const { data: usersPage } = useSWR("ref-users-all", () =>
    usersService.search({ page: 1, limit: 100 }),
  )

  const technicians =
    usersPage?.data.filter((u) => u.role.name === "Technicien") ?? []

  useEffect(() => {
    if (!open) return
    if (repair) {
      setForm({
        material_id: repair.material.id,
        description: repair.description,
        status: repair.status,
        technician_id: repair.technician?.id ?? null,
        resolution: repair.resolution ?? "",
        cost: repair.cost ?? undefined,
      })
    } else {
      setForm(emptyForm)
    }
  }, [open, repair])

  function set<K extends keyof RepairCreateInput>(
    key: K,
    value: RepairCreateInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit(form)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const showResolution = form.status === "Résolue"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier la réparation" : "Déclarer une réparation"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour le suivi de l'intervention."
              : "Enregistrez une nouvelle panne ou intervention sur un équipement."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material">
              Matériel concerné <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.material_id ? String(form.material_id) : ""}
              onValueChange={(v) => set("material_id", Number(v))}
              disabled={isEdit}
            >
              <SelectTrigger id="material" className="w-full">
                <SelectValue placeholder="Sélectionner un équipement" />
              </SelectTrigger>
              <SelectContent>
                {materialsPage?.data.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.inventory_number} — {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Décrivez le problème constaté…"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as RepairStatus)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPAIR_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technician">Technicien</Label>
              <Select
                value={form.technician_id ? String(form.technician_id) : NONE}
                onValueChange={(v) =>
                  set("technician_id", v === NONE ? null : Number(v))
                }
              >
                <SelectTrigger id="technician" className="w-full">
                  <SelectValue placeholder="Assigner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Non assigné</SelectItem>
                  {technicians.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showResolution ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="resolution">Résolution</Label>
                <Textarea
                  id="resolution"
                  value={form.resolution ?? ""}
                  onChange={(e) => set("resolution", e.target.value)}
                  placeholder="Détail de la résolution apportée…"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Coût (TND)</Label>
                <Input
                  id="cost"
                  type="number"
                  min={0}
                  step="0.001"
                  value={form.cost ?? ""}
                  onChange={(e) =>
                    set(
                      "cost",
                      e.target.value === "" ? undefined : Number(e.target.value),
                    )
                  }
                  placeholder="0"
                />
              </div>
            </>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving || !form.material_id}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEdit ? "Enregistrer" : "Déclarer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
