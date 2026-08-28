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
import { useCategories, useLocations, useUsers } from "@/lib/hooks"
import { materialsApi } from "@/lib/api"
import { ApiError } from "@/lib/api-client"
import { materialStatusLabels } from "@/lib/format"
import type { Material, MaterialInput } from "@/lib/types"

const emptyForm: MaterialInput = {
  asset_code: "",
  name: "",
  category_id: 0,
  brand: "",
  model: "",
  serial_number: "",
  acquisition_date: "",
  warranty_end_date: "",
  status: "IN_SERVICE",
  location_id: undefined,
  assigned_user_id: undefined,
  purchase_price: undefined,
  description: "",
}

export function MaterialFormDialog({
  open,
  onOpenChange,
  material,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  material?: Material | null
  onSaved: () => void
}) {
  const { categories } = useCategories()
  const { locations } = useLocations()
  const { users } = useUsers()
  const [form, setForm] = useState<MaterialInput>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const isEdit = Boolean(material)

  useEffect(() => {
    if (material) {
      setForm({
        asset_code: material.asset_code,
        name: material.name,
        category_id: material.category_id,
        brand: material.brand ?? "",
        model: material.model ?? "",
        serial_number: material.serial_number ?? "",
        acquisition_date: material.acquisition_date ?? "",
        warranty_end_date: material.warranty_end_date ?? "",
        status: material.status,
        location_id: material.location_id ?? undefined,
        assigned_user_id: material.assigned_user_id ?? undefined,
        purchase_price: material.purchase_price ?? undefined,
        description: material.description ?? "",
      })
    } else {
      setForm(emptyForm)
    }
  }, [material, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.asset_code || !form.name || !form.category_id) {
      toast.error("Veuillez remplir les champs obligatoires")
      return
    }
    setSubmitting(true)
    try {
      const payload: MaterialInput = {
        ...form,
        brand: form.brand || null,
        model: form.model || null,
        serial_number: form.serial_number || null,
        acquisition_date: form.acquisition_date || null,
        warranty_end_date: form.warranty_end_date || null,
        description: form.description || null,
        location_id: form.location_id || null,
        assigned_user_id: form.assigned_user_id || null,
        purchase_price: form.purchase_price || null,
      }
      if (isEdit && material) {
        await materialsApi.update(material.id, payload)
        toast.success("Matériel mis à jour")
      } else {
        await materialsApi.create(payload)
        toast.success("Matériel ajouté")
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
            {isEdit ? "Modifier le matériel" : "Ajouter un matériel"}
          </DialogTitle>
          <DialogDescription>
            Renseignez les informations de l&apos;équipement informatique.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset_code">Code d&apos;actif *</Label>
              <Input
                id="asset_code"
                value={form.asset_code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, asset_code: e.target.value }))
                }
                placeholder="AST-0001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ordinateur portable"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select
                value={form.category_id ? String(form.category_id) : ""}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category_id: Number(v) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={form.status ?? "IN_SERVICE"}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v ?? "IN_SERVICE" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(materialStatusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                value={form.brand ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brand: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              <Input
                id="model"
                value={form.model ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, model: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serial_number">Numéro de série</Label>
              <Input
                id="serial_number"
                value={form.serial_number ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, serial_number: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Prix d&apos;achat (TND)</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                value={form.purchase_price ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    purchase_price: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acquisition_date">Date d&apos;acquisition</Label>
              <Input
                id="acquisition_date"
                type="date"
                value={form.acquisition_date ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    acquisition_date: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_end_date">Fin de garantie</Label>
              <Input
                id="warranty_end_date"
                type="date"
                value={form.warranty_end_date ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    warranty_end_date: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Emplacement</Label>
              <Select
                value={form.location_id ? String(form.location_id) : "none"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    location_id: v === "none" ? undefined : Number(v),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.place}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Utilisateur assigné</Label>
              <Select
                value={
                  form.assigned_user_id ? String(form.assigned_user_id) : "none"
                }
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    assigned_user_id: v === "none" ? undefined : Number(v),
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
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
