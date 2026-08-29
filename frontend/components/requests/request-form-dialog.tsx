"use client";

import { useState } from "react";
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
import { createRequest } from "@/lib/api/requests";
import { useAuth } from "@/lib/auth";
import { PRIORITY_LABELS, REQUEST_TYPE_LABELS } from "@/lib/constants";
import type { RequestPriority, RequestType, ServiceRequest } from "@/lib/types";

const TYPES: RequestType[] = ["SUPPORT", "INTERVENTION", "ACHAT"];
const PRIORITIES: RequestPriority[] = ["BASSE", "NORMALE", "HAUTE", "CRITIQUE"];

export function RequestFormDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (request: ServiceRequest) => void;
}) {
  const { user } = useAuth();
  const [type, setType] = useState<RequestType>("SUPPORT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<RequestPriority>("NORMALE");
  const [saving, setSaving] = useState(false);

  function reset() {
    setType("SUPPORT");
    setTitle("");
    setDescription("");
    setPriority("NORMALE");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createRequest({
        type,
        title,
        description,
        priority,
        created_by: user,
      });
      toast.success("Demande créée avec succès.");
      onSaved(created);
      onOpenChange(false);
      reset();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvelle demande</DialogTitle>
            <DialogDescription>
              Soumettez une demande de support, d&apos;intervention ou d&apos;achat.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as RequestType)}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {REQUEST_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as RequestPriority)}
                >
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Écran externe ne s'allume plus"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre demande en détail..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
