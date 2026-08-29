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
import { referenceService, usersService } from "@/lib/api/services"
import type {
  Material,
  MaterialCreateInput,
  MaterialStatus,
} from "@/types"

const MATERIAL_STATUSES: MaterialStatus[] = [
  "En service",
  "En panne",
  "En réparation",
  "En stock",
  "Réformé",
]

const NONE = "__none__"

const emptyForm: MaterialCreateInput = {
  inventory_number: "",
  name: "",
  brand: "",
  model: "",
  serial_number: "",
  status: "En service",
  category_id: 0,
  location_id: null,
  assigned_to_id: null,
  purchase_date: "",
  warranty_end: "",
  notes: "",
}

export function MaterialFormDialog({
  open,
  onOpenChange,
  material,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  material?: Material | null
  onSubmit: (input: MaterialCreateInput) => Promise<void>
}) {
  const isEdit = Boolean(material)
  const [form, setForm] = useState<MaterialCreateInput>(emptyForm)
  const [saving, setSaving] = useState(false)

  const { data: categories } = useSWR("ref-categories", () =>
    referenceService.categories(),
  )
  const { data: locations } = useSWR("ref-locations", () =>
    referenceService.locations(),
  )
  const { data: usersPage } = useSWR("ref-users-all", () =>
    usersService.search({ page: 1, limit: 100 }),
  )

  useEffect(() => {
    if (!open) return
    if (material) {
      setForm({
        inventory_number: material.inventory_number,
        name: material.name,
        brand: material.brand ?? "",
        model: material.model ?? "",
        serial_number: material.serial_number ?? "",
        status: material.status,
        category_id: material.category.id,
        location_id: material.location?.id ?? null,
        assigned_to_id: material.assigned_to?.id ?? null,
        purchase_date: material.purchase_date ?? "",
        warranty_end: material.warranty_end ?? "",
        notes: material.notes ?? "",
      })
    } else {
      setForm({ ...emptyForm, category_id: categories?.[0]?.id ?? 0 })
    }
  }, [open, material, categories])

  function set<K extends keyof MaterialCreateInput>(
    key: K,
    value: MaterialCreateInput[K],
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>
            {isEdit ? "Modifier le matériel" : "Ajouter un matériel"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations de l'équipement."
              : "Renseignez les informations du nouvel équipement du parc."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inventory_number">
                Code inventaire <span className="text-destructive">*</span>
              </Label>
              <Input
                id="inventory_number"
                value={form.inventory_number}
                onChange={(e) => set("inventory_number", e.target.value)}
                placeholder="COMET-1024"
                required
                disabled={isEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Désignation <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ordinateur portable Dell"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                value={form.brand ?? ""}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="Dell"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              <Input
                id="model"
                value={form.model ?? ""}
                onChange={(e) => set("model", e.target.value)}
                placeholder="Latitude 5540"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial_number">Numéro de série</Label>
              <Input
                id="serial_number"
                value={form.serial_number ?? ""}
                onChange={(e) => set("serial_number", e.target.value)}
                placeholder="SN-000123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">État</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as MaterialStatus)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Catégorie <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category_id ? String(form.category_id) : ""}
                onValueChange={(v) => set("category_id", Number(v))}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Select
                value={form.location_id ? String(form.location_id) : NONE}
                onValueChange={(v) =>
                  set("location_id", v === NONE ? null : Number(v))
                }
              >
                <SelectTrigger id="location" className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Non attribuée</SelectItem>
                  {locations?.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned">Utilisateur affecté</Label>
              <Select
                value={form.assigned_to_id ? String(form.assigned_to_id) : NONE}
                onValueChange={(v) =>
                  set("assigned_to_id", v === NONE ? null : Number(v))
                }
              >
                <SelectTrigger id="assigned" className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Non affecté</SelectItem>
                  {usersPage?.data.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Date d&apos;acquisition</Label>
              <Input
                id="purchase_date"
                type="date"
                value={form.purchase_date ?? ""}
                onChange={(e) => set("purchase_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warranty_end">Fin de garantie</Label>
              <Input
                id="warranty_end"
                type="date"
                value={form.warranty_end ?? ""}
                onChange={(e) => set("warranty_end", e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes ?? ""}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Informations complémentaires…"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEdit ? "Enregistrer" : "Ajouter le matériel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
