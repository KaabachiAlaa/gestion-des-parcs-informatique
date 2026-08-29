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
import { materialsService } from "@/lib/api/services"
import type {
  RequestCreateInput,
  RequestPriority,
  RequestType,
} from "@/types"

const TYPES: RequestType[] = ["Support", "Intervention", "Achat"]
const PRIORITIES: RequestPriority[] = ["Basse", "Normale", "Haute", "Urgente"]
const NONE = "__none__"

const emptyForm: RequestCreateInput = {
  type: "Support",
  title: "",
  description: "",
  priority: "Normale",
  material_id: null,
}

export function RequestFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: RequestCreateInput) => Promise<void>
}) {
  const [form, setForm] = useState<RequestCreateInput>(emptyForm)
  const [saving, setSaving] = useState(false)

  const { data: materialsPage } = useSWR("ref-materials-all", () =>
    materialsService.search({ page: 1, limit: 100 }),
  )

  useEffect(() => {
    if (open) setForm(emptyForm)
  }, [open])

  function set<K extends keyof RequestCreateInput>(
    key: K,
    value: RequestCreateInput[K],
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle demande</DialogTitle>
          <DialogDescription>
            Soumettez une demande de support, d&apos;intervention ou d&apos;achat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => set("type", v as RequestType)}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => set("priority", v as RequestPriority)}
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Titre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Objet de la demande"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Détaillez votre demande…"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="material">Matériel concerné (optionnel)</Label>
            <Select
              value={form.material_id ? String(form.material_id) : NONE}
              onValueChange={(v) =>
                set("material_id", v === NONE ? null : Number(v))
              }
            >
              <SelectTrigger id="material" className="w-full">
                <SelectValue placeholder="Aucun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Aucun</SelectItem>
                {materialsPage?.data.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.inventory_number} — {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
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
              Soumettre
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
