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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, updateUser } from "@/lib/api/users";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role, User } from "@/lib/types";

const ROLES: Role[] = ["Admin", "Technicien", "Consultant"];

function emptyForm() {
  return {
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "Consultant" as Role,
  };
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSaved: (user: User) => void;
}) {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(user);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      });
    } else {
      setForm(emptyForm());
    }
  }, [user, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = isEdit
        ? await updateUser(user!.id, form)
        : await createUser({ ...form, is_active: true });

      if (saved) {
        toast.success(isEdit ? "Utilisateur mis à jour." : "Utilisateur créé.");
        onSaved(saved);
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Modifier l'utilisateur" : "Créer un utilisateur"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Mettez à jour les informations de ce compte."
                : "Ajoutez un nouveau membre à l'équipe."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
            <div className="col-span-full flex flex-col gap-1.5">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <Input
                id="username"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="p.nom"
              />
            </div>
            <div className="col-span-full flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nom@comet.tn"
              />
            </div>
            <div className="col-span-full flex flex-col gap-1.5">
              <Label htmlFor="role">Rôle</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
