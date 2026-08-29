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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { referenceService } from "@/lib/api/services"
import type { User, UserCreateInput } from "@/types"

interface UserFormState {
  username: string
  email: string
  full_name: string
  password: string
  role_id: number
  is_active: boolean
}

const emptyForm: UserFormState = {
  username: "",
  email: "",
  full_name: "",
  password: "",
  role_id: 0,
  is_active: true,
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSubmit: (input: UserCreateInput) => Promise<void>
}) {
  const isEdit = Boolean(user)
  const [form, setForm] = useState<UserFormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const { data: roles } = useSWR("ref-roles", () => referenceService.roles())

  useEffect(() => {
    if (!open) return
    if (user) {
      setForm({
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        password: "",
        role_id: user.role.id,
        is_active: user.is_active,
      })
    } else {
      setForm({ ...emptyForm, role_id: roles?.[0]?.id ?? 0 })
    }
  }, [open, user, roles])

  function set<K extends keyof UserFormState>(key: K, value: UserFormState[K]) {
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
          <DialogTitle>
            {isEdit ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour le compte et le rôle de l'utilisateur."
              : "Créez un nouveau compte et attribuez-lui un rôle."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Nom complet <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="Alaa Kaabachi"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">
                Nom d&apos;utilisateur <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="a.kaabachi"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="a.kaabachi@comet.tn"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">
                Mot de passe{" "}
                {isEdit ? (
                  <span className="text-xs font-normal text-muted-foreground">
                    (laisser vide pour conserver)
                  </span>
                ) : (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="••••••••"
                required={!isEdit}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">
                Rôle <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.role_id ? String(form.role_id) : ""}
                onValueChange={(v) => set("role_id", Number(v))}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <Checkbox
              id="is_active"
              checked={form.is_active}
              onCheckedChange={(v) => set("is_active", v === true)}
              className="mt-0.5"
            />
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="cursor-pointer">
                Compte actif
              </Label>
              <p className="text-xs text-muted-foreground">
                Un compte désactivé ne peut pas se connecter à la plateforme.
              </p>
            </div>
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
            <Button type="submit" disabled={saving || !form.role_id}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEdit ? "Enregistrer" : "Créer le compte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
