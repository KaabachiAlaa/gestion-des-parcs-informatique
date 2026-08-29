"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMaterial, updateMaterial } from "@/lib/api/materials";
import { MATERIAL_STATUS_LABELS } from "@/lib/constants";
import type { Category, Location, Material, MaterialStatus } from "@/lib/types";

const STATUS_OPTIONS = Object.keys(MATERIAL_STATUS_LABELS) as MaterialStatus[];

function emptyForm() {
  return {
    asset_code: "",
    name: "",
    brand: "",
    model: "",
    serial_number: "",
    status: "EN_STOCK" as MaterialStatus,
    category_id: "",
    location_id: "",
    acquisition_date: new Date().toISOString().slice(0, 10),
    warranty_end_date: "",
    purchase_price: "",
    description: "",
  };
}

export function MaterialFormDialog({
  open,
  onOpenChange,
  material,
  categories,
  locations,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material | null;
  categories: Category[];
  locations: Location[];
  onSaved: (material: Material) => void;
}) {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(material);

  useEffect(() => {
    if (material) {
      setForm({
        asset_code: material.asset_code,
        name: material.name,
        brand: material.brand,
        model: material.model,
        serial_number: material.serial_number,
        status: material.status,
        category_id: String(material.category.id),
        location_id: String(material.location.id),
        acquisition_date: material.acquisition_date.slice(0, 10),
        warranty_end_date: material.warranty_end_date?.slice(0, 10) ?? "",
        purchase_price: material.purchase_price ? String(material.purchase_price) : "",
        description: material.description ?? "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [material, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const category = categories.find((c) => c.id === Number(form.category_id));
    const location = locations.find((l) => l.id === Number(form.location_id));
    if (!category || !location) {
      toast.error("Veuillez sélectionner une catégorie et un emplacement.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        asset_code: form.asset_code,
        name: form.name,
        brand: form.brand,
        model: form.model,
        serial_number: form.serial_number,
        status: form.status,
        category,
        location,
        assigned_user: material?.assigned_user ?? null,
        acquisition_date: new Date(form.acquisition_date).toISOString(),
        warranty_end_date: form.warranty_end_date
          ? new Date(form.warranty_end_date).toISOString()
          : null,
        purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
        description: form.description || null,
      };

      const saved = isEdit
        ? await updateMaterial(material!.id, payload)
        : await createMaterial(payload);

      if (saved) {
        toast.success(isEdit ? "Matériel mis à jour." : "Matériel ajouté.");
        onSaved(saved);
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Modifier le matériel" : "Ajouter un matériel"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Mettez à jour les informations de cet équipement."
                : "Renseignez les informations du nouvel équipement."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto py-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset_code">Code inventaire</Label>
              <Input
                id="asset_code"
                required
                value={form.asset_code}
                onChange={(e) => setForm({ ...form, asset_code: e.target.value })}
                placeholder="INV-0001"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Désignation</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Laptop Dell Latitude"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                required
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="model">Modèle</Label>
              <Input
                id="model"
                required
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="serial_number">Numéro de série</Label>
              <Input
                id="serial_number"
                required
                value={form.serial_number}
                onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as MaterialStatus })}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {MATERIAL_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category_id">Catégorie</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm({ ...form, category_id: v })}
              >
                <SelectTrigger id="category_id" className="w-full">
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location_id">Emplacement</Label>
              <Select
                value={form.location_id}
                onValueChange={(v) => setForm({ ...form, location_id: v })}
              >
                <SelectTrigger id="location_id" className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acquisition_date">Date d&apos;acquisition</Label>
              <Input
                id="acquisition_date"
                type="date"
                required
                value={form.acquisition_date}
                onChange={(e) => setForm({ ...form, acquisition_date: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="warranty_end_date">Fin de garantie</Label>
              <Input
                id="warranty_end_date"
                type="date"
                value={form.warranty_end_date}
                onChange={(e) => setForm({ ...form, warranty_end_date: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="purchase_price">Prix d&apos;achat (TND)</Label>
              <Input
                id="purchase_price"
                type="number"
                min="0"
                value={form.purchase_price}
                onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
              />
            </div>
            <div className="col-span-full flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
