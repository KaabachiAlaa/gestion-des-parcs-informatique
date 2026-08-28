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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRoles } from "@/lib/hooks"
import { usersApi, type UserInput } from "@/lib/api"
import { ApiError } from "@/lib/api-client"
import type { User } from "@/lib/types"

const emptyForm: UserInput = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  role_id: 0,
  password: "",
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSaved: () => void
}) {
  const { roles } = useRoles()
  const [form, setForm] = useState<UserInput>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const isEdit = Boolean(user)

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role_id: user.role_id,
        password: "",
      })
    } else {
      setForm(emptyForm)
    }
  }, [user, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (
      !form.username ||
      !form.first_name ||
      !form.last_name ||
      !form.email ||
      !form.role_id ||
      (!isEdit && !form.password)
    ) {
      toast.error("Veuillez remplir les champs obligatoires")
      return
    }
    setSubmitting(true)
    try {
      if (isEdit && user) {
        const payload: Partial<UserInput> = {
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          role_id: form.role_id,
        }
        if (form.password) payload.password = form.password
        await usersApi.update(user.id, payload)
        toast.success("Utilisateur mis à jour")
      } else {
        await usersApi.create(form)
        toast.success("Utilisateur créé")
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations du compte."
              : "Créez un nouveau compte utilisateur."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom *</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, last_name: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nom d&apos;utilisateur *</Label>
            <Input
              id="username"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Rôle *</Label>
            <Select
              value={form.role_id ? String(form.role_id) : ""}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, role_id: v ? Number(v) : 0 }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {isEdit
                ? "Nouveau mot de passe (laisser vide pour ne pas changer)"
                : "Mot de passe *"}
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required={!isEdit}
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
